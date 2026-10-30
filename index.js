/**
 * Host half of PDX Forge.
 *
 * Serves three local routes to the sidebar panel:
 *   GET  /pdx-forge/data   – scans the installed game + the current mod, so the
 *                            panel only ever shows advances and modifiers that
 *                            exist on THIS machine (nothing mod-specific is
 *                            baked into the distributed bundle).
 *   POST /pdx-forge/ai     – asks the configured model to turn a Chinese
 *                            description into trigger/effect script.
 *   POST /pdx-forge/write  – writes generated files into the mod, with the
 *                            UTF-8 BOM the game expects.
 */
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const PKG_DIR = path.dirname(fileURLToPath(import.meta.url))
/** `.dsh/plugins/pdx-forge` → the mod root that contains `in_game/`. */
const DERIVED_MOD_ROOT = path.resolve(PKG_DIR, '..', '..', '..')

const GAME_ROOT_CANDIDATES = [
  'D:/SteamLibrary/steamapps/common/Europa Universalis V/game',
  'C:/Program Files (x86)/Steam/steamapps/common/Europa Universalis V/game',
  'C:/Program Files/Steam/steamapps/common/Europa Universalis V/game',
  'E:/SteamLibrary/steamapps/common/Europa Universalis V/game',
  'F:/SteamLibrary/steamapps/common/Europa Universalis V/game',
]

const UNLOCK_KINDS = [
  ['unlock_levy', '征召兵'],
  ['unlock_unit', '单位'],
  ['unlock_building', '建筑'],
  ['unlock_government_reform', '政府改革'],
  ['unlock_law', '法律'],
  ['unlock_policy', '政策'],
  ['unlock_estate_privilege', '阶层特权'],
  ['unlock_production_method', '生产方法'],
  ['unlock_town_rights', '城镇权利'],
  ['unlock_cabinet_action', '内阁行动'],
  ['unlock_ability', '能力'],
  ['unlock_casus_belli', '宣战理由'],
  ['unlock_chivalric_order', '骑士团'],
  ['unlock_country_interaction', '国家互动'],
  ['unlock_diplomacy', '外交行动'],
  ['unlock_heir_selection', '继承人选择'],
  ['unlock_interaction', '互动'],
  ['unlock_road_type', '道路类型'],
  ['unlock_subject_type', '附属国类型'],
]

const EVENT_TYPES = [
  ['country_event', '国家事件'],
  ['location_event', '地点事件'],
  ['unit_event', '单位事件'],
  ['exploration_event', '探索事件'],
  ['age_event', '时代事件'],
]

const MOD_CATEGORIES = [
  ['country', '国家'],
  ['location', '地点'],
  ['province', '省份'],
  ['character', '角色'],
  ['unit', '单位'],
  ['mercenary', '雇佣兵'],
  ['religion', '宗教'],
  ['internationalorganization', '国际组织'],
  ['rebel', '叛乱'],
  ['dynasty', '王朝'],
  ['none', '无'],
  ['all', '通用'],
]

/**
 * Every Chinese localisation table the panel may need: the base game, each
 * installed DLC (some names only exist there, e.g. pronoia / cabinet actions),
 * and the current mod.
 */
function locDirectories(gameRoot, modRoot) {
  const dirs = [path.join(gameRoot, 'main_menu', 'localization', 'simp_chinese')]
  let dlcEntries = []
  try { dlcEntries = fs.readdirSync(path.join(gameRoot, 'dlc'), { withFileTypes: true }) } catch { dlcEntries = [] }
  for (const entry of dlcEntries) {
    if (entry.isDirectory()) dirs.push(path.join(gameRoot, 'dlc', entry.name, 'main_menu', 'localization', 'simp_chinese'))
  }
  return dirs.filter(exists)
}

function collectLocDirs(dirs) {
  const map = new Map()
  for (const dir of dirs) for (const file of walkFiles(dir, (name) => name.endsWith('.yml'))) parseLocFile(file, map)
  return map
}

/* ------------------------------------------------------------------ parsing */
const exists = (p) => { try { fs.accessSync(p); return true } catch { return false } }

function readText(p) { return fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '') }

function walkFiles(dir, filter, out = []) {
  let entries
  try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return out }
  for (const entry of entries) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walkFiles(p, filter, out)
    else if (filter(entry.name)) out.push(p)
  }
  return out
}

/** Depth-0 `id = { ... }` blocks with their raw body. */
function parseBlocks(text) {
  const out = []
  const n = text.length
  const ident = /[A-Za-z0-9_\-]/
  let i = 0, depth = 0, cur = null, bodyStart = 0
  while (i < n) {
    const c = text[i]
    if (c === '#') { while (i < n && text[i] !== '\n') i++; continue }
    if (c === '"') {
      i++
      while (i < n) {
        if (text[i] === '\\') i += 2
        else if (text[i] === '"') { i++; break }
        else i++
      }
      continue
    }
    if (c === '{') { depth++; i++; continue }
    if (c === '}') {
      depth--
      i++
      if (depth === 0 && cur) { out.push({ id: cur, body: text.slice(bodyStart, i - 1) }); cur = null }
      continue
    }
    if (depth === 0 && ident.test(c)) {
      let j = i
      while (j < n && ident.test(text[j])) j++
      const id = text.slice(i, j)
      let k = j
      while (k < n && /\s/.test(text[k])) k++
      if (text[k] === '=') {
        k++
        while (k < n && /\s/.test(text[k])) k++
        if (text[k] === '{') { cur = id; depth = 1; bodyStart = k + 1; i = k + 1; continue }
      }
      i = j
      continue
    }
    i++
  }
  return out
}

function parseLocFile(file, into = new Map()) {
  if (!exists(file)) return into
  for (const line of readText(file).split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_.\-]+)\s*:\s*"((?:[^"\\]|\\.)*)"\s*$/)
    if (m) into.set(m[1], m[2].replace(/\\"/g, '"'))
  }
  return into
}

function collectLoc(root, sub) {
  const map = new Map()
  for (const file of walkFiles(path.join(root, sub), (n) => n.endsWith('.yml'))) parseLocFile(file, map)
  return map
}

const MOD_ORDER = { country: 0, location: 1, province: 2, character: 3, unit: 4, mercenary: 5, religion: 6, internationalorganization: 7, rebel: 8, dynasty: 9, none: 10, all: 11 }
const SORT_MODS = (a, b) => {
  const ca = MOD_ORDER[a[3]] ?? 20
  const cb = MOD_ORDER[b[3]] ?? 20
  if (ca !== cb) return ca - cb
  return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
}

/* -------------------------------------------------------------------- scan */
function resolveGameRoot(preferred) {
  const candidates = [preferred, ...GAME_ROOT_CANDIDATES].filter(Boolean)
  for (const candidate of candidates) {
    if (exists(path.join(candidate, 'in_game', 'common', 'advances'))) return path.resolve(candidate)
  }
  return null
}

function detectModRoot(preferred) {
  const candidates = [preferred, DERIVED_MOD_ROOT, process.cwd()].filter(Boolean)
  for (const candidate of candidates) {
    if (exists(path.join(candidate, 'in_game', 'common'))) return path.resolve(candidate)
  }
  return null
}

/** Sources the panel last confirmed, kept beside the plugin so a restart keeps them. */
const SOURCES_FILE = path.join(PKG_DIR, 'sources.json')

function readSavedSources() {
  try {
    const parsed = JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf8'))
    return Array.isArray(parsed) ? parsed : null
  } catch { return null }
}

function saveSources(list) {
  try {
    fs.writeFileSync(SOURCES_FILE, JSON.stringify(
      list.map(({ path: savedPath, kind, label }) => ({ path: savedPath, kind, label })),
      null,
      1,
    ), 'utf8')
  } catch { /* read-only install */ }
}

/** Turn the panel's source list into absolute, validated descriptors. */
function normalizeSources(input, gameRoot, modRoot) {
  const list = []
  const push = (raw, kind, label) => {
    const rawPath = String(raw || '').trim()
    if (!rawPath) return
    const resolved = path.resolve(rawPath)
    list.push({ path: resolved, kind: kind === 'game' ? 'game' : 'mod', label: String(label || '').trim() || path.basename(resolved) })
  }
  if (Array.isArray(input)) {
    for (const entry of input) if (entry && typeof entry === 'object') push(entry.path, entry.kind, entry.label)
  }
  if (list.length) return list
  const saved = readSavedSources()
  if (saved) for (const entry of saved) if (entry && typeof entry === 'object') push(entry.path, entry.kind, entry.label)
  if (list.length) return list
  const game = resolveGameRoot(gameRoot)
  if (game) push(game, 'game', '原版')
  const mod = detectModRoot(modRoot)
  if (mod) push(mod, 'mod', path.basename(mod))
  return list
}

function sourceLocDirs(source) {
  if (source.kind === 'game') return locDirectories(source.path, '')
  return [
    path.join(source.path, 'in_game', 'localization', 'simp_chinese'),
    path.join(source.path, 'main_menu', 'localization', 'simp_chinese'),
  ].filter(exists)
}

function buildData(sources) {
  const warnings = []
  const timings = {}
  let markAt = Date.now()
  const mark = (label) => { timings[label] = Date.now() - markAt; markAt = Date.now() }

  const loc = new Map()
  const advanceMap = new Map()
  const modifierMap = new Map()
  const ageMap = new Map()
  const estateMap = new Map()
  const decisionCatMap = new Map()
  const lawCatMap = new Map()
  const perSource = []
  // Existing definitions, per editable content type: id -> { file, src }.
  const entryRaw = { advance: new Map(), decision: new Map(), event: new Map(), privilege: new Map(), law: new Map() }
  const ENTRY_DIRS = {
    decision: 'in_game/common/decisions',
    privilege: 'in_game/common/estate_privileges',
    law: 'in_game/common/laws',
  }

  for (let index = 0; index < sources.length; index += 1) {
    const source = sources[index]
    const info = {
      index,
      label: source.label,
      path: source.path,
      kind: source.kind,
      ok: false,
      error: '',
      counts: { advances: 0, modifiers: 0, ages: 0, estates: 0 },
    }
    perSource.push(info)
    if (!exists(path.join(source.path, 'in_game', 'common'))) {
      info.error = '缺少 in_game/common，不是有效的游戏或 MOD 目录'
      continue
    }
    info.ok = true

    for (const dir of sourceLocDirs(source)) {
      for (const file of walkFiles(dir, (name) => name.endsWith('.yml'))) parseLocFile(file, loc)
    }

    const root = source.path
    for (const file of walkFiles(path.join(root, 'in_game', 'common', 'advances'), (f) => f.endsWith('.txt'))) {
      for (const { id } of parseBlocks(readText(file))) {
        if (id === 'namespace' || advanceMap.has(id)) continue
        advanceMap.set(id, index)
        if (!entryRaw.advance.has(id)) entryRaw.advance.set(id, { file, src: index })
        info.counts.advances += 1
      }
    }

    for (const [type, dir] of Object.entries(ENTRY_DIRS)) {
      for (const file of walkFiles(path.join(root, dir), (f) => f.endsWith('.txt'))) {
        for (const { id } of parseBlocks(readText(file))) {
          if (entryRaw[type].has(id)) continue
          entryRaw[type].set(id, { file, src: index })
        }
      }
    }

    // Events are `namespace = x` plus `x.N = { ... }` blocks.
    for (const file of walkFiles(path.join(root, 'in_game', 'events'), (f) => f.endsWith('.txt'))) {
      const text = readText(file)
      for (const match of text.matchAll(/^([A-Za-z_][A-Za-z0-9_]*\.\d+)[ \t]*=[ \t]*\{/gm)) {
        if (entryRaw.event.has(match[1])) continue
        entryRaw.event.set(match[1], { file, src: index })
      }
    }

    const modifierFiles = [
      ...walkFiles(path.join(root, 'main_menu', 'common', 'modifier_type_definitions'), (f) => f.endsWith('.txt')),
      ...walkFiles(path.join(root, 'in_game', 'common', 'modifier_type_definitions'), (f) => f.endsWith('.txt')),
    ]
    for (const file of modifierFiles) {
      for (const { id, body } of parseBlocks(readText(file))) {
        if (modifierMap.has(id) || /\bai\s*=\s*yes/.test(body)) continue
        const kind = /\bboolean\s*=\s*yes/.test(body) ? 2 : /\b(percent|already_percent)\s*=\s*yes/.test(body) ? 1 : 0
        const cat = (body.match(/\bcategory\s*=\s*([A-Za-z0-9_]+)/) || [])[1] || 'all'
        const hidden = /\bshould_show_in_modifiers_tab\s*=\s*no/.test(body) ? 1 : 0
        modifierMap.set(id, { src: index, kind, cat, hidden })
        info.counts.modifiers += 1
      }
    }

    for (const file of walkFiles(path.join(root, 'in_game', 'common', 'age'), (f) => f.endsWith('.txt'))) {
      for (const { id } of parseBlocks(readText(file))) {
        if (ageMap.has(id)) continue
        ageMap.set(id, index)
        info.counts.ages += 1
      }
    }

    for (const file of walkFiles(path.join(root, 'in_game', 'common', 'estates'), (f) => f.endsWith('.txt'))) {
      for (const { id } of parseBlocks(readText(file))) {
        if (!id.endsWith('_estate') || estateMap.has(id)) continue
        estateMap.set(id, index)
        info.counts.estates += 1
      }
    }

    for (const file of walkFiles(path.join(root, 'in_game', 'common', 'decision_categories'), (f) => f.endsWith('.txt'))) {
      for (const { id, body } of parseBlocks(readText(file))) {
        if (decisionCatMap.has(id)) continue
        decisionCatMap.set(id, (body.match(/name_key\s*=\s*([A-Za-z0-9_]+)/) || [])[1] || '')
      }
    }

    for (const file of walkFiles(path.join(root, 'in_game', 'common', 'laws'), (f) => f.endsWith('.txt'))) {
      for (const match of readText(file).matchAll(/^\s*law_category\s*=\s*([a-z_]+)/gm)) {
        if (!lawCatMap.has(match[1])) lawCatMap.set(match[1], index)
      }
    }
  }
  mark('scan')

  const anyLoc = (key) => loc.get(key)

  /**
   * Rewrite the references that Paradox localisation embeds in a name:
   * `$entry$` (unit / good / cabinet action / DLC concept) and
   * `[ShowSomething('id')]` / `[concept|e]` dynamic commands. Anything still
   * unresolved is dropped by `resolveLabel`, so the picker never shows markup.
   */
  const COMMAND = /\[([A-Za-z_][A-Za-z0-9_]*)(?:\(([^)]*)\))?(?:\|[a-zA-Z])?\]/g
  const resolveText = (text, depth = 0) => {
    if (!text || depth > 5) return text || ''
    let out = String(text)
    if (out.indexOf('$') >= 0) {
      out = out.replace(/\$([A-Za-z0-9_.\-]+)\$/g, (match, key) => {
        const value = anyLoc(key)
        return value === undefined ? match : resolveText(value, depth + 1)
      })
    }
    if (out.indexOf('[') >= 0) {
      out = out.replace(COMMAND, (match, fn, rawArg) => {
        if (rawArg !== undefined) {
          const arg = rawArg.replace(/^['"]|['"]$/g, '').trim()
          if (!arg) return ''
          const candidates = [arg, 'CHARACTER_INTERACTION_NAME_' + arg, 'CABINET_ACTION_NAME_' + arg, 'game_concept_' + arg]
          for (const candidate of candidates) {
            const value = anyLoc(candidate)
            if (value !== undefined) return resolveText(value, depth + 1)
          }
          return ''
        }
        const concept = anyLoc('game_concept_' + fn) || anyLoc(fn)
        return concept === undefined ? '' : resolveText(concept, depth + 1)
      })
    }
    return out
  }
  const resolveLabel = (text) => {
    if (!text) return ''
    return resolveText(text)
      .replace(/\[[^\]]*\]/g, '')
      .replace(/\$[^$]*\$/g, '')
      .replace(/£[^£]*£/g, '')
      .replace(/#[a-zA-Z_!]+/g, '')
      .replace(/§./g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
  const labelOf = (key) => resolveLabel(anyLoc(key) || '')

  const meta = { ages: [], decisionCategories: [], lawCategories: [], estates: [], unlockKinds: [], eventTypes: [], modCats: [], commonModifiers: [] }
  for (const [id, label] of MOD_CATEGORIES) meta.modCats.push({ id, label })
  for (const [id, label] of UNLOCK_KINDS) meta.unlockKinds.push({ id, label })
  for (const [id, label] of EVENT_TYPES) meta.eventTypes.push({ id, label })

  for (const [id, src] of ageMap) meta.ages.push({ id, label: labelOf(id) || id, src })
  meta.ages.sort((a, b) => (a.id < b.id ? -1 : 1))

  for (const [id, nameKey] of decisionCatMap) meta.decisionCategories.push({ id, label: (nameKey && labelOf(nameKey)) || id })

  for (const [id, src] of lawCatMap) {
    const key = id.toUpperCase() + '_LAW_CATEGORY'
    meta.lawCategories.push({ id, label: labelOf(key) || id, key, src })
  }

  for (const [id, src] of estateMap) meta.estates.push({ id, label: labelOf(id) || id, src })
  meta.estates.sort((a, b) => (a.id < b.id ? -1 : 1))

  const advances = [...advanceMap].map(([id, src]) => [id, labelOf(id) || id, src])
  advances.sort((a, b) => {
    const am = a[2] === 0 ? 1 : 0
    const bm = b[2] === 0 ? 1 : 0
    if (am !== bm) return am - bm
    return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
  })

  const modifiers = [...modifierMap].map(([id, value]) => [
    id,
    labelOf('MODIFIER_TYPE_NAME_' + id) || id,
    value.kind,
    value.cat,
    value.hidden,
    value.src,
  ])
  modifiers.sort(SORT_MODS)

  // widely used modifiers, for the picker's default order
  const usage = new Map()
  const known = new Set(modifierMap.keys())
  for (const source of sources) {
    const files = [
      ...walkFiles(path.join(source.path, 'in_game', 'common', 'advances'), (f) => f.endsWith('.txt')),
      ...walkFiles(path.join(source.path, 'in_game', 'common', 'estate_privileges'), (f) => f.endsWith('.txt')),
    ]
    for (const file of files) {
      for (const match of readText(file).matchAll(/^\s*([a-z][a-z0-9_]{2,})\s*=\s*(-?[0-9.]+|yes|no)\s*$/gm)) {
        if (!known.has(match[1])) continue
        usage.set(match[1], (usage.get(match[1]) || 0) + 1)
      }
    }
  }
  meta.commonModifiers = [...usage.entries()].sort((a, b) => b[1] - a[1]).slice(0, 60).map(([key]) => key)
  mark('meta')

  const customModifiers = modifiers.filter((m) => m[5] > 0).length
  const customAdvances = advances.filter((a) => a[2] > 0).length
  if (customModifiers === 0) warnings.push('当前数据源里没有 MOD 自定义修正。')

  const gameSource = sources.find((s) => s.kind === 'game')
  const modSource = sources.find((s) => s.kind === 'mod')

  const entriesByType = {}
  for (const type of Object.keys(entryRaw)) {
    const list = []
    for (const [id, meta] of entryRaw[type]) {
      const name = type === 'event'
        ? (labelOf(id + '.title') || id)
        : type === 'decision'
          ? (labelOf(id + '.title') || labelOf(id) || id)
          : (labelOf(id) || id)
      list.push([id, name, meta.file, meta.src])
    }
    list.sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0))
    entriesByType[type] = list
  }

  return {
    ok: true,
    sources: perSource,
    roots: { game: gameSource ? gameSource.path : '', mod: modSource ? modSource.path : '' },
    counts: {
      modifiers: modifiers.length,
      advances: advances.length,
      customModifiers,
      customAdvances,
      ages: meta.ages.length,
      sources: sources.length,
    },
    warnings,
    timings,
    meta,
    modifiers,
    advances,
    entriesByType,
  }
}

/** Panel payload without the (large) per-entry index; `/entries` serves that on demand. */
export function publicView(value) {
  if (!value || !value.ok) return value
  const { entriesByType, ...rest } = value
  return rest
}

const cache = new Map()
const CACHE_TTL = 60_000

export async function scanProject({ gameRoot, modRoot, sources, refresh } = {}) {
  const normalized = normalizeSources(sources, gameRoot, modRoot)
  if (!normalized.length) {
    return { ok: false, error: '没有可用的数据源：请添加原版游戏目录或 MOD 目录。' }
  }
  if (Array.isArray(sources) && sources.length) saveSources(normalized)
  const key = normalized.map((s) => `${s.kind}:${s.path}`).join('|')
  const hit = cache.get(key)
  if (!refresh && hit && Date.now() - hit.at < CACHE_TTL) return hit.value
  const value = buildData(normalized)
  if (Array.isArray(value.sources) && value.sources.length && !value.sources.some((s) => s.ok)) {
    return { ok: false, error: '所有数据源都无效：请检查路径下是否有 in_game/common。', sources: value.sources }
  }
  cache.set(key, { at: Date.now(), value })
  return value
}

/* --------------------------------------------------------------------- ai */
const SCRIPT_RULES = [
  '你是《欧陆风云5》(Europa Universalis V) 的 Clausewitz 脚本专家。',
  '把制作者的中文需求翻译成触发器(trigger)与效果(effect)片段。',
  '只输出一个 JSON 对象，不要 Markdown 代码块，不要任何解释文字。',
  '键只能是 potential / allow / trigger / effect / option，只输出被要求的键。',
  'potential、allow、effect 的值是大括号内部的脚本行（不含最外层大括号），用换行分隔，缩进用制表符。',
  'option 的值是给玩家看的中文按钮文字，不含脚本。',
  '只使用真实存在的 EU5 触发器与效果；不确定时用最通用可靠的写法，例如 has_or_had_tag、owns、gold、at_war、has_advance、add_gold、add_prestige、add_legitimacy、add_country_modifier。',
  '默认作用域 root = 国家；与地点相关时显式写 location:<id> = { ... }。',
  '不要发明不存在的命令，不要在脚本行里写注释。',
].join('\n')

export function buildAiPrompt(request) {
  const lines = [
    `内容类型：${request.typeLabel || request.type}`,
    `名称：${request.name || '（未填）'}`,
    `描述：${request.desc || '（未填）'}`,
  ]
  if (request.tag) lines.push(`国家 TAG：${request.tag}`)
  if (request.extra) lines.push(`已知条件：${request.extra}`)
  if (request.modifiers && request.modifiers.length) lines.push(`已选修正：${request.modifiers.join('，')}`)
  lines.push(`需要生成的字段：${(request.fields || ['potential', 'allow', 'effect']).join('、')}`)
  if (request.instruction) lines.push(`制作者的要求：${request.instruction}`)
  return lines.join('\n')
}

export function parseAiJson(text) {
  const raw = String(text || '').trim()
  if (!raw) return null
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  const body = fenced ? fenced[1] : raw
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  try {
    const parsed = JSON.parse(body.slice(start, end + 1))
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

async function generateWithModel(ctx, request) {
  const llm = ctx.get('llm')
  const selector = ctx.get('agentDefaultModel')
  if (!llm || typeof llm.stream !== 'function') return { ok: false, error: '当前 profile 没有 llm 服务。' }
  const selection = selector && typeof selector.currentSelection === 'function' ? selector.currentSelection() : null
  if (!selection || !selection.provider || !selection.model) {
    return { ok: false, error: '当前 profile 还没有选择默认模型，请先在设置里选一个模型。' }
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 90_000)
  try {
    const stream = llm.stream({
      provider: selection.provider,
      model: selection.model,
      system: SCRIPT_RULES,
      messages: [{ role: 'user', content: [{ type: 'text', text: buildAiPrompt(request) }] }],
      maxTokens: 1600,
      signal: controller.signal,
    })
    let text = ''
    let failure = null
    for await (const chunk of stream) {
      if (chunk.type === 'text-delta') text += chunk.text
      else if (chunk.type === 'finish' && chunk.reason && chunk.reason.kind === 'error') {
        failure = chunk.reason.failure
      } else if (chunk.type === 'finish' && chunk.reason && chunk.reason.kind === 'aborted') {
        failure = chunk.reason.failure || { message: '已取消' }
      }
    }
    if (failure) return { ok: false, error: `模型调用失败：${failure.message || failure.code || '未知错误'}` }
    const parsed = parseAiJson(text)
    if (!parsed) return { ok: false, error: '模型没有返回可解析的 JSON。', raw: text.slice(0, 800) }
    return { ok: true, fields: parsed, model: `${selection.provider}/${selection.model}` }
  } catch (err) {
    return { ok: false, error: `模型调用异常：${err && err.message ? err.message : String(err)}` }
  } finally {
    clearTimeout(timer)
  }
}

/* ------------------------------------------------------------------- write */
function bomFor(relPath) {
  if (/\.(gui|txt|yml|yaml)$/i.test(relPath)) return '\uFEFF'
  return '\uFEFF'
}

/**
 * Locate one `id = { ... }` definition in a script file and return its exact
 * span, honouring comments and strings so braces inside text cannot derail it.
 */
export function extractBlock(text, id) {
  const wanted = String(id || '').trim()
  if (!wanted) return null
  const escaped = wanted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp('(^|\\n)([ \\t]*)(' + escaped + ')([ \\t]*=[ \\t]*\\{)').exec(text)
  if (!match) return null
  const idStart = match.index + match[1].length + match[2].length
  const open = match.index + match[0].length - 1
  let depth = 0
  let i = open
  while (i < text.length) {
    const ch = text[i]
    if (ch === '#') { while (i < text.length && text[i] !== '\n') i += 1; continue }
    if (ch === '"') {
      i += 1
      while (i < text.length) {
        if (text[i] === '\\') i += 2
        else if (text[i] === '"') { i += 1; break }
        else i += 1
      }
      continue
    }
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) return { start: idStart, end: i + 1, text: text.slice(idStart, i + 1) }
    }
    i += 1
  }
  return null
}

/** Every simp_chinese directory to search, mod sources first (they override). */
function localisationDirs(sources) {
  const dirs = []
  for (const source of [...sources].reverse()) {
    if (source.kind !== 'mod') continue
    for (const dir of sourceLocDirs(source)) dirs.push({ dir, mod: true, root: source.path })
  }
  for (const source of sources) {
    if (source.kind !== 'game') continue
    for (const dir of locDirectories(source.path, '')) dirs.push({ dir, mod: false, root: source.path })
  }
  return dirs
}

const locCache = new Map()

function unescapeLocValue(value) {
  return String(value).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\')
}

/**
 * Find the localisation keys that belong to one definition: the entry itself,
 * `<id>_*` and `<id>.*` keys, plus sub-definitions (law policies) by name.
 */
export function findLocEntries({ sources, id, blockText }) {
  const wanted = []
  const addId = (value) => {
    if (!value) return
    for (const key of [value, value + '_desc']) if (!wanted.includes(key)) wanted.push(key)
  }
  addId(id)
  if (blockText) {
    for (const match of blockText.matchAll(/^[ \t]*([A-Za-z][A-Za-z0-9_]{2,})[ \t]*=[ \t]*\{/gm)) {
      const child = match[1]
      if (['potential', 'allow', 'trigger', 'effect', 'option', 'ai_will_do', 'country_modifier', 'can_revoke', 'hidden_trigger', 'custom_tooltip', 'if', 'else', 'limit'].includes(child)) continue
      addId(child)
    }
  }
  const dirs = localisationDirs(sources)
  const pattern = /^[ \t]*([A-Za-z0-9_.\-]+)[ \t]*:[ \t]*"((?:[^"\\]|\\.)*)"/
  const found = new Map()
  const wantedSet = new Set(wanted)
  for (const { dir, mod, root } of dirs) {
    if (found.size >= wantedSet.size) break
    for (const file of walkFiles(dir, (name) => name.endsWith('.yml'))) {
      if (found.size >= wantedSet.size) break
      for (const line of readText(file).split(/\r?\n/)) {
        const match = pattern.exec(line)
        if (!match || !wantedSet.has(match[1]) || found.has(match[1])) continue
        found.set(match[1], { key: match[1], text: unescapeLocValue(match[2]), path: file, editable: mod, root })
      }
    }
  }
  return wanted.map((key) => {
    const hit = found.get(key)
    return hit || { key, text: '', path: '', editable: false, root: '' }
  })
}

/** Read one existing definition for the editor, together with its localisation. */
export async function readEntryBlock({ sources, modRoot, path: filePath, id, type }) {
  const rawPath = String(filePath || '')
  if (!rawPath) return { ok: false, error: '缺少文件路径' }
  const abs = path.resolve(rawPath)
  const normalized = normalizeSources(sources, undefined, modRoot)
  const roots = normalized.map((source) => source.path)
  if (!roots.some((root) => abs.toLowerCase().startsWith(root.toLowerCase() + path.sep))) {
    return { ok: false, error: '该文件不在任何数据源内' }
  }
  if (!exists(abs)) return { ok: false, error: '文件不存在' }
  const text = readText(abs)
  const block = extractBlock(text, id)
  if (!block) return { ok: false, error: '文件里找不到这个条目，可能已被改名或移动' }

  const cacheKey = `${id}|${abs}|${type || ''}`
  let loc = locCache.get(cacheKey)
  if (!loc) {
    loc = findLocEntries({ sources: normalized, id, blockText: block.text })
    if (locCache.size > 500) locCache.clear()
    locCache.set(cacheKey, loc)
  }
  const source = normalized.find((s) => abs.toLowerCase().startsWith(s.path.toLowerCase() + path.sep))
  return { ok: true, text: block.text, path: abs, loc, sourcePath: source ? source.path : '' }
}

export function clearLocCache() { locCache.clear() }

function escapeLocText(text) {
  return String(text == null ? '' : text).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, '\\n')
}

/** Replace or add localisation values, keeping every other line of the file. */
export function mergeLocValues(existing, entries) {
  const lines = existing ? existing.split(/\r?\n/) : []
  let header = lines.findIndex((line) => /^\s*l_simp_chinese:\s*$/.test(line))
  if (header < 0) { lines.push('l_simp_chinese:'); header = lines.length - 1 }
  for (const entry of entries || []) {
    const key = String(entry && entry.key ? entry.key : '').trim()
    if (!key) continue
    const re = new RegExp('^([ \\t]*)' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[ \\t]*:')
    const idx = lines.findIndex((line) => re.test(line))
    const line = ` ${key}: "${escapeLocText(entry.text)}"`
    if (idx >= 0) lines[idx] = line
    else { lines.splice(header + 1, 0, line); header += 1 }
  }
  return lines.join('\n')
}

export async function writeFiles({ modRoot, sources, files }) {
  const roots = []
  for (const source of normalizeSources(sources, undefined, modRoot)) {
    if (source.kind === 'mod' && !roots.some((r) => r.toLowerCase() === source.path.toLowerCase())) roots.push(source.path)
  }
  const fallback = detectModRoot(modRoot)
  if (fallback && !roots.some((r) => r.toLowerCase() === fallback.toLowerCase())) roots.push(fallback)
  if (!roots.length) return { ok: false, error: '没有可写的 MOD 数据源。' }
  const results = []
  for (const file of files || []) {
    const raw = String(file.path || '')
    if (!raw) { results.push({ path: raw, ok: false, error: '非法路径' }); continue }
    const abs = path.isAbsolute(raw) ? path.resolve(raw) : path.resolve(roots[0], raw.replace(/\\/g, '/').replace(/^\/+/, ''))
    const root = roots.find((candidate) => abs.toLowerCase().startsWith(candidate.toLowerCase() + path.sep))
    if (!root) { results.push({ path: raw, ok: false, error: '路径不在任何 MOD 数据源内' }); continue }
    const rel = path.relative(root, abs).split(path.sep).join('/')
    const mode = file.mode === 'append' ? 'append' : file.mode === 'replace-block' ? 'replace-block' : file.mode === 'loc-upsert' ? 'loc-upsert' : 'replace'
    const text = String(file.text || '')
    const body = text.startsWith('\uFEFF') ? text.slice(1) : text
    try {
      const existed = exists(abs)
      await fsp.mkdir(path.dirname(abs), { recursive: true })

      if (mode === 'loc-upsert') {
        if (!/\.(yml|yaml)$/i.test(rel)) { results.push({ path: rel, ok: false, error: '本地化只能写入 .yml 文件' }); continue }
        const previous = existed ? (await fsp.readFile(abs, 'utf8')).replace(/^\uFEFF/, '') : ''
        const next = '\uFEFF' + mergeLocValues(previous, file.entries || [])
        if (existed && next === '\uFEFF' + previous) { results.push({ path: rel, ok: true, unchanged: true, mode }); continue }
        await fsp.writeFile(abs, next, 'utf8')
        results.push({ path: rel, ok: true, existed, mode, added: (file.entries || []).length })
        continue
      }

      if (mode === 'replace-block') {
        if (!existed) { results.push({ path: rel, ok: false, error: '目标文件不存在' }); continue }
        const previous = (await fsp.readFile(abs, 'utf8')).replace(/^\uFEFF/, '')
        const block = extractBlock(previous, String(file.id || ''))
        if (!block) { results.push({ path: rel, ok: false, error: '文件里找不到该条目，可能已被改名' }); continue }
        if (block.text.trim() === body.trim()) { results.push({ path: rel, ok: true, unchanged: true, mode }); continue }
        const next = '\uFEFF' + previous.slice(0, block.start) + body.trimEnd() + previous.slice(block.end)
        await fsp.writeFile(abs, next, 'utf8')
        results.push({ path: rel, ok: true, existed: true, mode, added: 1 })
        continue
      }

      if (mode === 'append' && existed) {
        const previous = (await fsp.readFile(abs, 'utf8')).replace(/^\uFEFF/, '')
        const merged = /\.(yml|yaml)$/i.test(rel) ? mergeLocFile(previous, body) : appendScript(previous, body)
        if (merged === null) {
          results.push({ path: rel, ok: false, error: '目标文件没有 l_simp_chinese: 段，无法追加本地化' })
          continue
        }
        if (merged.added === 0) { results.push({ path: rel, ok: true, unchanged: true, mode }); continue }
        const next = '\uFEFF' + merged.text
        await fsp.writeFile(abs, next, 'utf8')
        results.push({ path: rel, ok: true, existed: true, mode, added: merged.added })
        continue
      }

      const withBom = bomFor(rel) + body
      const previous = existed ? await fsp.readFile(abs, 'utf8') : null
      if (previous === withBom) { results.push({ path: rel, ok: true, unchanged: true, mode }); continue }
      await fsp.writeFile(abs, withBom, 'utf8')
      results.push({ path: rel, ok: true, existed, mode, added: 1 })
    } catch (err) {
      results.push({ path: rel, ok: false, error: err && err.message ? err.message : String(err) })
    }
  }
  return { ok: results.every((r) => r.ok), root: roots[0], files: results }
}

/** Append one generated `id = { ... }` block unless that id already exists. */
function appendScript(existing, incoming) {
  const match = incoming.match(/^\s*([A-Za-z0-9_\-]+)\s*=\s*\{/m)
  if (match) {
    const escaped = match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp('(^|\\n)[ \\t]*' + escaped + '[ \\t]*=[ \\t]*\\{').test(existing)) return { text: existing, added: 0 }
  } else if (existing.includes(incoming.trim())) {
    return { text: existing, added: 0 }
  }
  const body = incoming.replace(/\s*$/, '')
  return { text: existing.replace(/\s*$/, '') + '\n\n' + body + '\n', added: 1 }
}

/** Insert localisation lines after the `l_simp_chinese:` header, skipping keys already present. */
function mergeLocFile(existing, incoming) {
  const have = new Set()
  for (const line of existing.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_.\-]+)\s*:/)
    if (m) have.add(m[1])
  }
  const add = []
  for (const line of incoming.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || /^l_[a-z_]+:\s*$/.test(trimmed)) continue
    const m = line.match(/^\s*([A-Za-z0-9_.\-]+)\s*:/)
    if (m && have.has(m[1])) continue
    add.push(line.replace(/\s+$/, ''))
    if (m) have.add(m[1])
  }
  if (!add.length) return { text: existing, added: 0 }
  const lines = existing.split(/\r?\n/)
  const header = lines.findIndex((line) => /^\s*l_simp_chinese:\s*$/.test(line))
  if (header < 0) return null
  lines.splice(header + 1, 0, ...add)
  return { text: lines.join('\n'), added: add.length }
}

/** Where each content type lands, relative to the mod root. */
const TYPE_DIRS = {
  advance: 'in_game/common/advances',
  decision: 'in_game/common/decisions',
  event: 'in_game/events',
  privilege: 'in_game/common/estate_privileges',
  law: 'in_game/common/laws',
}
const LOC_DIR = 'in_game/localization/simp_chinese'

let picking = false

/**
 * Open the Windows file dialog and resolve the picked absolute path.
 *
 * The chosen path is handed back through a temp file rather than stdout: a
 * piped stdio would be a named pipe, which confined runtimes refuse to create.
 * `-STA` is required because WinForms dialogs need a single-threaded apartment.
 */
export function openFileDialog({ startDir, kind, timeoutMs }) {
  return new Promise((resolve) => {
    const filter = kind === 'loc'
      ? '本地化 (*.yml)|*.yml|所有文件 (*.*)|*.*'
      : '脚本 (*.txt)|*.txt|所有文件 (*.*)|*.*'
    const quote = (value) => String(value || '').replace(/'/g, "''")
    const outFile = path.join(os.tmpdir(), `pdx-forge-pick-${process.pid}-${Date.now()}.txt`)
    const script = [
      'Add-Type -AssemblyName System.Windows.Forms | Out-Null',
      '$d = New-Object System.Windows.Forms.OpenFileDialog',
      `$d.InitialDirectory = '${quote(startDir)}'`,
      `$d.Filter = '${quote(filter)}'`,
      "$d.Title = 'PDX 模改工坊：选择要写入的文档'",
      '$d.CheckFileExists = $true',
      '$d.Multiselect = $false',
      `if ($d.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { Set-Content -LiteralPath '${quote(outFile)}' -Value $d.FileName -Encoding UTF8 }`,
    ].join('; ')

    let child
    try {
      child = spawn('powershell.exe', ['-NoProfile', '-STA', '-Command', script], { windowsHide: true, stdio: 'ignore' })
    } catch (err) {
      resolve({ ok: false, error: err && err.message ? err.message : String(err) })
      return
    }

    let settled = false
    const finish = (value) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try { fs.rmSync(outFile, { force: true }) } catch { /* already gone */ }
      resolve(value)
    }
    const timer = setTimeout(() => {
      try { child.kill() } catch { /* already gone */ }
      finish({ ok: false, canceled: true, error: '等待选择超时' })
    }, timeoutMs || 180_000)

    child.on('error', (err) => finish({ ok: false, error: err && err.message ? err.message : String(err) }))
    child.on('close', () => {
      let file = ''
      try {
        file = fs.readFileSync(outFile, 'utf8').replace(/^\uFEFF/, '').trim()
      } catch { /* cancelled */ }
      finish(file ? { ok: true, file } : { ok: false, canceled: true })
    })
  })
}

/** Resolve the picked file into a mod-relative path the writer accepts. */
export async function pickExistingFile({ modRoot, sources, type, kind }) {
  if (picking) return { ok: false, error: '已经有一个文件选择窗口在等待。' }
  const normalized = normalizeSources(sources, undefined, modRoot)
  const roots = normalized.filter((source) => source.kind === 'mod').map((source) => source.path)
  const base = roots[0] || detectModRoot(modRoot)
  if (!base) return { ok: false, error: '没有可写的 MOD 数据源。' }
  if (!roots.includes(base)) roots.push(base)
  const startDir = path.join(base, kind === 'loc' ? LOC_DIR : TYPE_DIRS[type] || TYPE_DIRS.advance)
  picking = true
  try {
    const picked = await openFileDialog({ startDir, kind })
    if (!picked.ok) return picked
    const abs = path.resolve(picked.file)
    const root = roots.find((candidate) => abs.toLowerCase().startsWith(candidate.toLowerCase() + path.sep))
    if (!root) return { ok: false, error: '请选择 MOD 数据源内的文件。' }
    return { ok: true, path: path.relative(root, abs).split(path.sep).join('/'), name: path.basename(abs) }
  } finally {
    picking = false
  }
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(payload),
  })
  res.end(payload)
}

async function readJsonBody(req, limit = 4_000_000) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) throw new Error('请求体过大')
    chunks.push(chunk)
  }
  if (!chunks.length) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export function apply(ctx, config) {
  const settings = config && typeof config === 'object' ? config : {}
  let booted = false
  const boot = (scope) => {
    if (booted) return
    booted = true
    // Read through get(): a property access on a scoped context throws when the
    // service was not declared in that scope.
    const web = scope.get ? scope.get('webServer') : undefined
    if (!web) {
      ctx.logger?.warn?.('[pdx-forge] webServer 不可用，面板无法获取游戏数据。')
      return
    }
    registerRoutes(scope, web, settings)
  }
  // webServer may already be up, or appear later in the composition.
  if (ctx.get && ctx.get('webServer')) boot(ctx)
  else if (typeof ctx.inject === 'function') ctx.inject(['webServer'], boot)
}

function registerRoutes(ctx, web, settings) {
  ctx.effect(() =>
    web.register({
      kind: 'exact',
      path: '/pdx-forge/data',
      async handler(req, res) {
        if (req.method !== 'GET') return sendJson(res, 405, { ok: false, error: 'method not allowed' })
        const url = new URL(req.url || '/', 'http://localhost')
        try {
          const data = await scanProject({
            gameRoot: settings.gameRoot,
            modRoot: settings.modRoot,
            refresh: url.searchParams.get('refresh') === '1',
          })
          sendJson(res, data.ok ? 200 : 500, publicView(data))
        } catch (err) {
          sendJson(res, 500, { ok: false, error: err && err.message ? err.message : String(err) })
        }
      },
    }),
  )

  ctx.effect(() =>
    web.register({
      kind: 'exact',
      path: '/pdx-forge/scan',
      async handler(req, res) {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'method not allowed' })
        try {
          const body = await readJsonBody(req)
          const data = await scanProject({
            gameRoot: settings.gameRoot,
            modRoot: settings.modRoot,
            sources: body.sources,
            refresh: body.refresh === true,
          })
          sendJson(res, data.ok ? 200 : 500, publicView(data))
        } catch (err) {
          sendJson(res, 500, { ok: false, error: err && err.message ? err.message : String(err) })
        }
      },
    }),
  )

  ctx.effect(() =>
    web.register({
      kind: 'exact',
      path: '/pdx-forge/entries',
      async handler(req, res) {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'method not allowed' })
        try {
          const body = await readJsonBody(req)
          const data = await scanProject({
            gameRoot: settings.gameRoot,
            modRoot: settings.modRoot,
            sources: body.sources,
          })
          if (!data.ok) return sendJson(res, 500, data)
          const type = typeof body.type === 'string' && data.entriesByType[body.type] ? body.type : 'advance'
          sendJson(res, 200, { ok: true, type, sources: data.sources, entries: data.entriesByType[type] || [] })
        } catch (err) {
          sendJson(res, 500, { ok: false, error: err && err.message ? err.message : String(err) })
        }
      },
    }),
  )

  ctx.effect(() =>
    web.register({
      kind: 'exact',
      path: '/pdx-forge/block',
      async handler(req, res) {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'method not allowed' })
        try {
          const body = await readJsonBody(req)
          sendJson(res, 200, await readEntryBlock({
            sources: body.sources,
            modRoot: settings.modRoot,
            path: body.path,
            id: body.id,
            type: body.type,
          }))
        } catch (err) {
          sendJson(res, 500, { ok: false, error: err && err.message ? err.message : String(err) })
        }
      },
    }),
  )

  ctx.effect(() =>
    web.register({
      kind: 'exact',
      path: '/pdx-forge/pick',
      async handler(req, res) {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'method not allowed' })
        try {
          const body = await readJsonBody(req)
          sendJson(res, 200, await pickExistingFile({
            modRoot: settings.modRoot,
            sources: body.sources,
            type: body.type,
            kind: body.kind === 'loc' ? 'loc' : 'script',
          }))
        } catch (err) {
          sendJson(res, 500, { ok: false, error: err && err.message ? err.message : String(err) })
        }
      },
    }),
  )

  ctx.effect(() =>
    web.register({
      kind: 'exact',
      path: '/pdx-forge/ai',
      async handler(req, res) {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'method not allowed' })
        try {
          const body = await readJsonBody(req)
          sendJson(res, 200, await generateWithModel(ctx, body))
        } catch (err) {
          sendJson(res, 500, { ok: false, error: err && err.message ? err.message : String(err) })
        }
      },
    }),
  )

  ctx.effect(() =>
    web.register({
      kind: 'exact',
      path: '/pdx-forge/write',
      async handler(req, res) {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'method not allowed' })
        try {
          const body = await readJsonBody(req)
          const result = await writeFiles({ modRoot: settings.modRoot, sources: body.sources, files: body.files })
          if (result.ok) clearLocCache()
          sendJson(res, 200, result)
        } catch (err) {
          sendJson(res, 500, { ok: false, error: err && err.message ? err.message : String(err) })
        }
      },
    }),
  )
}
