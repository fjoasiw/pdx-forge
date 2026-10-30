// Prints resolved labels for a few placeholder-heavy modifiers.
// Run: node tools/check-labels.mjs
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanProject } from '../index.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const modRoot = path.resolve(here, '..', '..', '..')
const data = await scanProject({ modRoot })
if (!data.ok) {
  console.log('scan failed:', data.error)
  process.exit(1)
}
console.log('timings', data.timings)
console.log('modifiers', data.counts.modifiers)
const ids = [
  'a_clan_retainer_cavalry_build_cost_modifier',
  'a_clan_retainers_maintenance_cost_modifier',
  'a_clan_retainers_reinforce_cost_modifier',
  'land_morale_modifier',
  'allow_cabinet_assimilate_area',
  'allow_cabinet_diplomatic_corps',
  'allow_appoint_adelantado_mayor',
  'enable_pronoia_subject',
  'ambition_slots',
  'contesting_ambition_slots',
]
const byId = new Map(data.modifiers.map((m) => [m[0], m]))
for (const id of ids) console.log(id, '=>', (byId.get(id) || [])[1])
const dollar = data.modifiers.filter((m) => m[1].includes('$'))
console.log('names still containing $:', dollar.length, dollar.slice(0, 5).map((m) => m[0] + '=' + m[1]))
const advanceDollar = data.advances.filter((a) => a[1].includes('$')).length
console.log('advance names containing $:', advanceDollar)
