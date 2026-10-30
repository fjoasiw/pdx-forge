// Exercises the Host half's HTTP routes without Cordis: registers them on a fake
// webServer, then drives the handlers with mock req/res.
// Run: node tools/route-test.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { apply } from '../index.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const routes = new Map()

function fakeCtx(extra = {}) {
  return {
    get(name) {
      if (name === 'webServer') return { register: (route) => { routes.set(route.path, route); return () => routes.delete(route.path) } }
      return extra[name]
    },
    effect(fn) { fn() },
    logger: { warn() {}, info() {}, error() {} },
  }
}

function makeRes() {
  return {
    statusCode: 0,
    headers: null,
    body: '',
    writeHead(status, headers) { this.statusCode = status; this.headers = headers },
    end(data) { this.body = data || '' },
  }
}

function makeReq(method, url, payload) {
  const buffer = payload === undefined ? null : Buffer.from(JSON.stringify(payload), 'utf8')
  return {
    method,
    url,
    async *[Symbol.asyncIterator]() { if (buffer) yield buffer },
  }
}

async function call(pathname, method, payload) {
  const route = routes.get(pathname.split('?')[0])
  if (!route) throw new Error('route not registered: ' + pathname)
  const res = makeRes()
  await route.handler(makeReq(method, pathname, payload), res)
  return { status: res.statusCode, json: JSON.parse(res.body) }
}

apply(fakeCtx(), {})

const data = await call('/pdx-forge/data', 'GET')
console.log('GET /data', data.status, data.json.ok, data.json.counts)
if (data.json.ok) {
  console.log('roots', data.json.roots)
  console.log('ages', data.json.meta.ages.map((a) => a.label).join('/'))
}

const badMethod = await call('/pdx-forge/data', 'POST')
console.log('POST /data ->', badMethod.status)

const scan = await call('/pdx-forge/scan', 'POST', {})
console.log('POST /scan defaults ->', scan.status, scan.json.ok, (scan.json.sources || []).map((s) => `${s.label}:${s.kind}:${s.counts.modifiers}m/${s.counts.advances}a`).join(' | '))

const scanBad = await call('/pdx-forge/scan', 'POST', { sources: [{ path: 'C:/definitely-not-here', kind: 'mod' }] })
console.log('POST /scan invalid ->', scanBad.status, scanBad.json.ok, JSON.stringify(scanBad.json.error))

const entries = await call('/pdx-forge/entries', 'POST', {})
console.log('POST /entries ->', entries.status, entries.json.ok, (entries.json.entries || []).length, 'entries')
const modEntry = (entries.json.entries || []).find((entry) => entry[3] === 1)
if (modEntry) {
  const block = await call('/pdx-forge/block', 'POST', { path: modEntry[2], id: modEntry[0] })
  console.log('POST /block ->', block.status, block.json.ok, (block.json.text || block.json.error || '').split('\n')[0])
} else {
  console.log('POST /block -> skipped (no mod entry)')
}

const ai = await call('/pdx-forge/ai', 'POST', { type: 'decision', name: 'x', desc: 'y', fields: ['potential'] })
console.log('POST /ai without llm ->', ai.status, ai.json.ok, JSON.stringify(ai.json.error))

// write against a throwaway mod root
const fixture = path.join(here, '..', '_route_fixture')
fs.mkdirSync(path.join(fixture, 'in_game', 'common'), { recursive: true })
apply(fakeCtx(), { modRoot: fixture })
const written = await call('/pdx-forge/write', 'POST', {
  files: [
    { path: 'in_game/common/advances/acgv_route_test.txt', text: 'acgv_route_test = {\n\tage = age_1_traditions\n}\n' },
    { path: 'in_game/localization/simp_chinese/acgv_route_test_l_simp_chinese.yml', text: 'l_simp_chinese:\n acgv_route_test: "测试"\n' },
    { path: '../../outside.txt', text: 'nope' },
  ],
})
console.log('POST /write ->', written.status, JSON.stringify(written.json.files))
for (const rel of ['in_game/common/advances/acgv_route_test.txt', 'in_game/localization/simp_chinese/acgv_route_test_l_simp_chinese.yml']) {
  const abs = path.join(fixture, rel)
  const bytes = fs.readFileSync(abs)
  console.log(rel, 'bom=', bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf)
}

// the file dialog route must reject non-POST without opening a window
const pickGuard = await call('/pdx-forge/pick', 'GET')
console.log('GET /pick ->', pickGuard.status)

// append: same block twice is de-duplicated by id
const again = await call('/pdx-forge/write', 'POST', {
  files: [{ path: 'in_game/common/advances/acgv_route_test.txt', mode: 'append', text: 'acgv_route_test = {\n\tage = age_2_renaissance\n}\n' }],
})
console.log('append same id ->', JSON.stringify(again.json.files))

// append: new localisation key lands after the l_simp_chinese header, existing keys stay
const locAppend = await call('/pdx-forge/write', 'POST', {
  files: [{
    path: 'in_game/localization/simp_chinese/acgv_route_test_l_simp_chinese.yml',
    mode: 'append',
    text: 'l_simp_chinese:\n acgv_route_test: "重复"\n acgv_route_test_desc: "新描述"\n',
  }],
})
console.log('append loc ->', JSON.stringify(locAppend.json.files))
console.log(fs.readFileSync(path.join(fixture, 'in_game/localization/simp_chinese/acgv_route_test_l_simp_chinese.yml'), 'utf8').replace(/^\uFEFF/, ''))

// append to a yml without the language header is refused
fs.writeFileSync(path.join(fixture, 'in_game/localization/simp_chinese/no_header.yml'), 'acgv_x: "x"\n', 'utf8')
const noHeader = await call('/pdx-forge/write', 'POST', {
  files: [{ path: 'in_game/localization/simp_chinese/no_header.yml', mode: 'append', text: 'l_simp_chinese:\n acgv_y: "y"\n' }],
})
console.log('append no header ->', JSON.stringify(noHeader.json.files))

fs.rmSync(fixture, { recursive: true, force: true })
