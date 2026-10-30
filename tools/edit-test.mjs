// Exercises the "edit existing definition" path: block extraction, block read,
// and replace-in-place writes.
// Run: node tools/edit-test.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanProject, extractBlock, readEntryBlock, writeFiles, mergeLocValues } from '../index.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const modRoot = path.resolve(here, '..', '..', '..')

const data = await scanProject({ modRoot, refresh: true })
const counts = Object.fromEntries(Object.entries(data.entriesByType).map(([k, v]) => [k, v.length]))
console.log('entries per type:', counts)
const modAdvance = data.entriesByType.advance.find((entry) => entry[3] > 0)
console.log('sample mod advance:', modAdvance && modAdvance.slice(0, 3))

if (modAdvance) {
  const block = await readEntryBlock({ modRoot, path: modAdvance[2], id: modAdvance[0], type: 'advance' })
  console.log('read block ok:', block.ok, 'first line:', block.ok ? block.text.split('\n')[0] : block.error)
  console.log('block starts with id:', block.ok && block.text.startsWith(modAdvance[0]))
  console.log('loc entries:', block.ok && block.loc.map((entry) => `${entry.key}=${JSON.stringify(entry.text.slice(0, 14))}${entry.editable ? '(mod)' : entry.path ? '(game)' : '(new)'}`))
}

// localisation upsert keeps other lines and escapes quotes
const yml = 'l_simp_chinese:\n foo: "old"\n bar: "keep"\n'
const merged = mergeLocValues(yml, [{ key: 'foo', text: 'new "quoted"' }, { key: 'baz', text: 'multi\nline' }])
console.log('\nloc upsert:\n' + merged)

// brace matching must ignore strings and comments
const tricky = `foo = {\n\t# a comment with } brace\n\ttext = "{ not a block }"\n\tbar = { baz = yes }\n}\nafter = { x = 1 }\n`
const found = extractBlock(tricky, 'foo')
console.log('\ntricky block extracted:', !!found, JSON.stringify(found && found.text.split('\n').pop()))
console.log('stops before next block:', found && tricky.slice(found.end).trim().startsWith('after'))
const after = extractBlock(tricky, 'after')
console.log('second block found:', !!after)

// replace-block in a throwaway mod root
const fixture = path.join(here, '..', '_edit_fixture')
fs.mkdirSync(path.join(fixture, 'in_game', 'common', 'advances'), { recursive: true })
const target = path.join(fixture, 'in_game', 'common', 'advances', 'pack.txt')
fs.writeFileSync(target, '\uFEFFalpha = {\n\tage = age_1_traditions\n}\n\nbeta = {\n\tage = age_1_traditions\n}\n', 'utf8')

const sources = [{ path: fixture, kind: 'mod', label: 'fixture' }]
const write = await writeFiles({
  sources,
  files: [{ path: target, id: 'beta', mode: 'replace-block', text: 'beta = {\n\tage = age_2_renaissance\n\tmonthly_prestige = 1\n}' }],
})
console.log('\nreplace-block:', JSON.stringify(write.files))
const afterWrite = fs.readFileSync(target, 'utf8')
console.log('alpha kept:', afterWrite.includes('alpha = {'))
console.log('beta updated:', afterWrite.includes('age_2_renaissance'))
console.log('BOM kept:', fs.readFileSync(target)[0] === 0xef)

const missing = await writeFiles({ sources, files: [{ path: target, id: 'gamma', mode: 'replace-block', text: 'gamma = { }' }] })
console.log('missing id ->', JSON.stringify(missing.files))

const outside = await writeFiles({ sources, files: [{ path: 'C:/Windows/System32/drivers/etc/hosts', id: 'x', mode: 'replace-block', text: 'x' }] })
console.log('outside root ->', JSON.stringify(outside.files))

// localisation upsert into a throwaway yml
const locDir = path.join(fixture, 'in_game', 'localization', 'simp_chinese')
fs.mkdirSync(locDir, { recursive: true })
const locTarget = path.join(locDir, 'beta_l_simp_chinese.yml')
fs.writeFileSync(locTarget, '\uFEFFl_simp_chinese:\n beta: "old"\n keep: "stay"\n', 'utf8')
const locWrite = await writeFiles({
  sources,
  files: [{ path: locTarget, mode: 'loc-upsert', entries: [{ key: 'beta', text: '新名字' }, { key: 'beta_desc', text: '新描述' }] }],
})
console.log('loc-upsert ->', JSON.stringify(locWrite.files))
const locText = fs.readFileSync(locTarget, 'utf8')
console.log('loc updated:', locText.includes('beta: "新名字"'), 'added:', locText.includes('beta_desc: "新描述"'), 'kept:', locText.includes('keep: "stay"'), 'bom:', fs.readFileSync(locTarget)[0] === 0xef)

fs.rmSync(fixture, { recursive: true, force: true })
