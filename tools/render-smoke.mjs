// Executes the panel's React tree in Node with a tiny React shim and fixture
// data, for every content type. Catches render-time crashes without a browser.
// Run: node tools/render-smoke.mjs
import { pathToFileURL, fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.resolve(here, '..', 'client.js')

let hooks = []
let hookIndex = 0

const React = {
  Fragment: '__fragment',
  createElement(type, props, ...children) {
    return { type, props: { ...(props || {}), children: children.length <= 1 ? children[0] : children } }
  },
  createContext(value) {
    const ctx = { value }
    ctx.Provider = function Provider(p) { ctx.value = p.value; return p.children }
    return ctx
  },
  useContext(ctx) { return ctx.value },
  useState(init) {
    const slot = hookIndex++
    if (hooks[slot] === undefined) hooks[slot] = typeof init === 'function' ? init() : init
    return [hooks[slot], () => {}]
  },
  useEffect() {},
  useMemo(fn) { return fn() },
  useRef(v) { return { current: v } },
  useCallback(fn) { return fn },
}

const fixture = {
  ok: true,
  roots: { game: 'G:/game', mod: 'C:/mod' },
  counts: { modifiers: 3, advances: 2, customModifiers: 1, customAdvances: 1 },
  warnings: [],
  meta: {
    ages: [{ id: 'age_1_traditions', label: '传统' }],
    decisionCategories: [{ id: 'other_decisions', label: '其他' }],
    lawCategories: [{ id: 'socioeconomic', label: '社会经济法', key: 'SOCIOECONOMIC_LAW_CATEGORY' }],
    estates: [{ id: 'nobles_estate', label: '贵族', source: 0 }],
    unlockKinds: [{ id: 'unlock_building', label: '建筑' }],
    eventTypes: [{ id: 'country_event', label: '国家事件' }],
    modCats: [{ id: 'country', label: '国家' }],
    commonModifiers: ['monthly_prestige'],
  },
  modifiers: [
    ['monthly_prestige', '每月威望', 0, 'country', 0, 0],
    ['land_morale_modifier', '陆军士气', 1, 'unit', 0, 0],
    ['acgv_custom', '自定义修正', 0, 'country', 0, 1],
  ],
  advances: [
    ['feudalism_advance', '封建制度', 0],
    ['acgv_mine', '我的革新', 1],
  ],
}

let plugin = null
let stored = null
globalThis.window = {
  __ModuleLoader__: { load(spec) { plugin = spec.factory(() => React) } },
  localStorage: { getItem: () => stored, setItem: () => {} },
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {},
}
globalThis.fetch = async () => ({ json: async () => fixture })

await import(pathToFileURL(clientPath).href)
if (!plugin || !plugin._test || !plugin._test.panel) throw new Error('bundle did not expose the panel')

const { panel: Panel, emptyForms } = plugin._test

const texts = []
function walk(node) {
  if (node == null || node === false || node === true) return
  if (typeof node === 'string' || typeof node === 'number') { texts.push(String(node)); return }
  if (Array.isArray(node)) { for (const child of node) walk(child); return }
  if (typeof node !== 'object') return
  if (typeof node.type === 'function') {
    const savedHooks = hooks
    const savedIndex = hookIndex
    hooks = []
    hookIndex = 0
    let out
    try { out = node.type(node.props) } finally { hooks = savedHooks; hookIndex = savedIndex }
    walk(out)
    return
  }
  if (node.type === '__fragment') { walk(node.props.children); return }
  walk(node.props && node.props.children)
}

const demo = {
  advance: { id: 'acgv_demo_advance', name: '示例革新', desc: '描述', tag: 'BA2', requires: ['feudalism_advance'], mods: [{ key: 'monthly_prestige', value: '0.5' }] },
  decision: { id: 'acgv_demo_decision', name: '示例决议', desc: '描述', tag: 'BA2', effect: 'add_gold = 100', mods: [{ key: 'monthly_legitimacy', value: '0.1' }] },
  event: { ns: 'acgv_demo_events', num: 2, title: '示例事件', desc: '描述', effect: 'add_prestige = 10', mods: [] },
  privilege: { id: 'acgv_demo_privilege', name: '示例特权', desc: '描述', mods: [{ key: 'acgv_custom', value: '0.1' }] },
  law: { id: 'acgv_demo_law', name: '示例法律', desc: '描述', policies: [{ id: 'acgv_demo_law_a', name: '甲', desc: '甲', mods: [{ key: 'monthly_prestige', value: '0.1' }] }] },
}

function renderFor(type, withData = true) {
  const forms = emptyForms()
  forms[type] = { ...forms[type], ...demo[type] }
  stored = JSON.stringify({ game: 'eu5', type, forms, customAdvances: [{ id: 'acgv_recorded', name: '记录的革新' }] })
  texts.length = 0
  const fakeCtx = { get: (name) => (name === 'locale' ? { register: () => () => {}, bind: () => (k) => k, subscribe: () => () => {} } : undefined) }
  walk(React.createElement(Panel, { ctx: fakeCtx, t: (k, vars) => {
    let out = k
    if (vars) for (const n of Object.keys(vars)) out = out.replace('{' + n + '}', String(vars[n]))
    return out
  }, dataOverride: withData ? fixture : undefined }))
  return texts.join('\n')
}

const expectations = {
  advance: ['age = age_1_traditions', 'requires = feudalism_advance', 'monthly_prestige = 0.5', 'out.write'],
  decision: ['decision_category = other_decisions', 'add_country_modifier', 'acgv_demo_decision.a'],
  event: ['namespace = acgv_demo_events', 'acgv_demo_events.2.title'],
  privilege: ['estate = nobles_estate', 'country_modifier', 'acgv_custom = 0.1'],
  law: ['law_category = socioeconomic', 'years = 2', 'SOCIOECONOMIC_LAW_CATEGORY'],
}

let failed = 0
for (const type of Object.keys(expectations)) {
  let out = ''
  try {
    out = renderFor(type)
  } catch (err) {
    failed++
    console.log(`FAIL ${type}: ${err && err.stack ? err.stack.split('\n').slice(0, 4).join(' | ') : err}`)
    continue
  }
  const missing = expectations[type].filter((needle) => !out.includes(needle))
  if (missing.length) { failed++; console.log(`FAIL ${type}: missing ${missing.join(', ')}`) }
  else console.log(`ok ${type}: ${out.length} chars`)
}

// reserved game + loading states must render too
try {
  stored = JSON.stringify({ game: 'eu4', type: 'advance', forms: emptyForms(), customAdvances: [] })
  texts.length = 0
  walk(React.createElement(Panel, { ctx: { get: () => undefined }, t: (k) => k, dataOverride: fixture }))
  console.log('ok reserved-game branch:', texts.includes('soon.title') ? 'shows interface note' : 'rendered')
} catch (err) {
  failed++
  console.log('FAIL reserved-game branch:', err && err.message)
}

try {
  stored = JSON.stringify({ game: 'eu5', type: 'advance', forms: emptyForms(), customAdvances: [] })
  texts.length = 0
  walk(React.createElement(Panel, { ctx: { get: () => undefined }, t: (k) => k }))
  console.log('ok loading state:', texts.includes('load.title') ? 'shows loading text' : 'rendered')
} catch (err) {
  failed++
  console.log('FAIL loading state:', err && err.message)
}

if (failed) { console.log(`\n${failed} failure(s)`); process.exitCode = 1 }
else console.log('\nall render smoke checks passed')

// write-payload routing: new file, renamed file, and append into a picked document
const { buildWritePayload, genDecision: genD, makeIndex: mk } = plugin._test
const idx = mk(fixture)
const dec = genD({ id: 'acgv_x', name: 'x', desc: 'y', category: 'other_decisions', tag: '', potential: '', allow: '', effect: '', option: '', ai: 100, mods: [] }, idx)
const fresh = buildWritePayload(dec.blocks, { script: '', scriptName: '', loc: '', locName: '' })
const renamed = buildWritePayload(dec.blocks, { script: '', scriptName: 'my_file.txt', loc: '', locName: '' })
const append = buildWritePayload(dec.blocks, { script: 'in_game/common/decisions/existing.txt', scriptName: '', loc: 'in_game/localization/simp_chinese/big_l_simp_chinese.yml', locName: '' })
console.log('payload new     :', fresh.map((f) => f.path + ':' + f.mode).join(' | '))
console.log('payload renamed :', renamed.map((f) => f.path + ':' + f.mode).join(' | '))
console.log('payload append  :', append.map((f) => f.path + ':' + f.mode).join(' | '))
const okFresh = fresh[0].path === 'in_game/common/decisions/acgv_x.txt' && fresh[0].mode === 'replace'
const okRenamed = renamed[0].path === 'in_game/common/decisions/my_file.txt'
const okAppend = append[0].mode === 'append' && append[1].mode === 'append'
console.log(okFresh && okRenamed && okAppend ? 'payload routing ok' : 'PAYLOAD ROUTING FAILED')
if (!(okFresh && okRenamed && okAppend)) process.exitCode = 1
