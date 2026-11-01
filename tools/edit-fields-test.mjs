// 结构化编辑的自检：解析 → 原样重建应完全一致；改一个字段只动那一处。
// Run: node tools/edit-fields-test.mjs
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanProject, readEntryBlock } from '../index.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const modRoot = path.resolve(here, '..', '..', '..')

// client.js 是浏览器模块，这里用 React/窗口桩把它跑起来
const React = {
  Fragment: '__fragment',
  createElement: () => null,
  createContext: () => ({ Provider: null }),
  useContext: () => null,
  useState: () => [undefined, () => {}],
  useEffect: () => {},
  useMemo: () => null,
  useRef: () => ({ current: null }),
  useCallback: (fn) => fn,
}
let plugin = null
globalThis.window = {
  __ModuleLoader__: { load(spec) { plugin = spec.factory(() => React) } },
  localStorage: { getItem: () => null, setItem: () => {} },
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {},
}
await import(new URL('../client.js', import.meta.url).href)

const { parseDefinition, readFields, applyFields, makeIndex } = plugin._test
const data = await scanProject({ refresh: true })
const idx = makeIndex(data)

const samples = []
for (const type of ['advance', 'decision', 'event', 'privilege', 'law']) {
  const list = (data.entriesByType[type] || []).filter((entry) => entry[3] > 0)
  samples.push([type, list.slice(0, 2)])
}

let failures = 0
for (const [type, entries] of samples) {
  if (!entries.length) { console.log(`skip ${type}: 没有 MOD 条目`); continue }
  for (const entry of entries) {
    const block = await readEntryBlock({ modRoot, path: entry[2], id: entry[0], type })
    if (!block.ok) { console.log(`FAIL ${type}/${entry[0]}: ${block.error}`); failures += 1; continue }

    const parsed = parseDefinition(block.text)
    if (!parsed) { console.log(`FAIL ${type}/${entry[0]}: 解析失败`); failures += 1; continue }

    const fields = readFields(type, block.text, idx)
    if (!fields) { console.log(`FAIL ${type}/${entry[0]}: 字段读取失败`); failures += 1; continue }

    const roundTrip = applyFields(type, block.text, fields, JSON.parse(JSON.stringify(fields)), idx)
    const identical = roundTrip === block.text
    if (!identical) {
      failures += 1
      console.log(`FAIL ${type}/${entry[0]}: 原样重建不一致 (${block.text.length} vs ${(roundTrip || '').length})`)
      const a = block.text.split('\n')
      const b = (roundTrip || '').split('\n')
      for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
        if (a[i] !== b[i]) { console.log(`  第 ${i + 1} 行:\n    - ${a[i]}\n    + ${b[i]}`); break }
      }
    } else {
      console.log(`ok  ${type}/${entry[0]}: 原样重建一致（${block.text.split('\n').length} 行）`)
    }
  }
}

// 定位测试：改 age 只影响 age 行，注释与其它字段保持
const advance = (data.entriesByType.advance || []).find((entry) => entry[3] > 0)
if (advance) {
  const block = await readEntryBlock({ modRoot, path: advance[2], id: advance[0], type: 'advance' })
  const fields = readFields('advance', block.text, idx)
  const original = JSON.parse(JSON.stringify(fields))
  fields.age = 'age_6_revolutions'
  const next = applyFields('advance', block.text, fields, original, idx)
  const before = block.text.split('\n')
  const after = next.split('\n')
  const changed = before.filter((line, i) => line !== after[i])
  const commentsKept = before.filter((line) => line.trim().startsWith('#')).length === after.filter((line) => line.trim().startsWith('#')).length
  console.log(`\n改 age → 变化行数 ${changed.length}，注释保留 ${commentsKept}`)
  console.log('  新 age 行存在:', after.some((line) => line.includes('age = age_6_revolutions')))
  if (changed.length === 0 || !commentsKept) failures += 1
}

// 修正组改动：注释仍保留
if (advance) {
  const block = await readEntryBlock({ modRoot, path: advance[2], id: advance[0], type: 'advance' })
  const fields = readFields('advance', block.text, idx)
  const original = JSON.parse(JSON.stringify(fields))
  fields.mods = (fields.mods || []).concat([{ key: 'monthly_prestige', value: '0.5' }])
  const next = applyFields('advance', block.text, fields, original, idx)
  const commentsKept = block.text.split('\n').filter((l) => l.trim().startsWith('#')).length === next.split('\n').filter((l) => l.trim().startsWith('#')).length
  console.log(`加一条修正：注释保留 ${commentsKept}，新行存在 ${next.includes('monthly_prestige = 0.5')}`)
  if (!commentsKept || !next.includes('monthly_prestige = 0.5')) failures += 1
}

// 注释密集的真实条目（截图里那条）：字段编辑不能吃掉行内注释
const dense = (data.entriesByType.advance || []).find((entry) => entry[0] === 'xbc_last_stop_of_light' && entry[3] > 0)
if (dense) {
  const block = await readEntryBlock({ modRoot, path: dense[2], id: dense[0], type: 'advance' })
  const fields = readFields('advance', block.text, idx)
  const original = JSON.parse(JSON.stringify(fields))
  console.log('\n注释密集条目字段:', JSON.stringify({ age: fields.age, icon: fields.icon, requires: fields.requires, mods: fields.mods }))
  const unchanged = applyFields('advance', block.text, fields, JSON.parse(JSON.stringify(fields)), idx) === block.text
  fields.potential = 'has_or_had_tag = XBC'
  const edited = applyFields('advance', block.text, fields, original, idx)
  const commentLines = block.text.split('\n').filter((line) => line.trim().startsWith('#')).length
  const kept = edited.split('\n').filter((line) => line.trim().startsWith('#')).length
  console.log(`  xbc_last_stop_of_light：原样一致 ${unchanged}，改 potential 后注释 ${kept}/${commentLines}`)
  if (!unchanged || kept !== commentLines) failures += 1

  // 改数值而不是删行：行内注释要跟着保留
  const again = readFields('advance', block.text, idx)
  const againOriginal = JSON.parse(JSON.stringify(again))
  again.mods = again.mods.map((row) => (row.key === 'power_projection' ? { ...row, value: '12' } : row))
  const tuned = applyFields('advance', block.text, again, againOriginal, idx)
  const keepsInline = /power_projection = 12\s+# 力量投射 \+10/.test(tuned)
  console.log(`  改数值保留行内注释: ${keepsInline}`)
  if (!keepsInline) failures += 1
}

console.log(failures ? `\n${failures} 处失败` : '\n结构化编辑自检通过')
process.exitCode = failures ? 1 : 0
