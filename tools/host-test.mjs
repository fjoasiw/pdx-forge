// Exercises the Host half without Cordis: scanner, AI prompt/parse, and file writing.
// Run: node tools/host-test.mjs
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { scanProject, buildAiPrompt, parseAiJson, writeFiles } from '../index.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const modRoot = path.resolve(here, '..', '..', '..')

const started = Date.now()
const data = await scanProject({ modRoot })
const elapsed = Date.now() - started
if (!data.ok) {
  console.log('scan failed:', data.error)
  process.exitCode = 1
} else {
  console.log(`scan ok in ${elapsed}ms`)
  console.log('roots', data.roots)
  console.log('counts', data.counts)
  console.log('warnings', data.warnings)
  console.log('ages', data.meta.ages.map((a) => a.label).join(' / '))
  console.log('decision cats', data.meta.decisionCategories.map((c) => c.label).join(' / '))
  console.log('law cats', data.meta.lawCategories.map((c) => c.label).join(' / '))
  console.log('estates', data.meta.estates.map((e) => e.label).join(' / '))
  console.log('custom advances', data.advances.filter((a) => a[2] === 1).slice(0, 3))
  const feudalism = data.advances.filter((a) => a[1].includes('封建')).slice(0, 3)
  console.log('search 封建', feudalism)
  console.log('country modifiers', data.modifiers.filter((m) => m[3] === 'country').length)
  console.log('sample modifier', data.modifiers.find((m) => m[0] === 'land_morale_modifier'))
  const timed = Date.now()
  await scanProject({ modRoot })
  console.log(`cached scan in ${Date.now() - timed}ms`)
}

console.log('\nprompt:\n' + buildAiPrompt({
  type: 'decision', typeLabel: '决议', name: '示例', desc: '描述', tag: 'BA2',
  fields: ['potential', 'allow', 'effect', 'option'], instruction: '只有和平时期可用，花费 100 金币换 50 威望',
  modifiers: ['monthly_prestige = 0.5'],
}))
console.log('parse:', parseAiJson('```json\n{"potential":"has_or_had_tag = BA2","effect":"add_gold = -100"}\n```'))

// write into a throwaway fixture that looks like a mod root
const fixture = path.join(here, '..', '_write_fixture')
fs.mkdirSync(path.join(fixture, 'in_game', 'common'), { recursive: true })
const written = await writeFiles({ modRoot: fixture, files: [
  { path: 'in_game/common/advances/acgv_test.txt', text: 'acgv_test = {\n\tage = age_1_traditions\n}\n' },
  { path: 'in_game/localization/simp_chinese/acgv_test_l_simp_chinese.yml', text: 'l_simp_chinese:\n acgv_test: "测试"\n' },
  { path: '../escape.txt', text: 'nope' },
] })
console.log('\nwrite:', JSON.stringify(written, null, 1))
for (const f of ['in_game/common/advances/acgv_test.txt', 'in_game/localization/simp_chinese/acgv_test_l_simp_chinese.yml']) {
  const abs = path.join(fixture, f)
  const bytes = fs.readFileSync(abs)
  console.log(f, 'bom=', bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf)
}
fs.rmSync(fixture, { recursive: true, force: true })
