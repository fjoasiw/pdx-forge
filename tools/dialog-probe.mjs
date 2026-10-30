// Opens the real Windows file dialog for 3 seconds, then cancels it. Confirms the
// PowerShell/WinForms setup reaches a visible dialog instead of failing to start.
// A dialog window will flash on screen; that is expected.
// Run: node tools/dialog-probe.mjs
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { openFileDialog } from '../index.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const modRoot = path.resolve(here, '..', '..', '..')

const started = Date.now()
const result = await openFileDialog({
  startDir: path.join(modRoot, 'in_game', 'common', 'advances'),
  kind: 'script',
  timeoutMs: 3000,
})
const elapsed = Date.now() - started
console.log('result:', JSON.stringify(result), `${elapsed}ms`)
if (result.error && result.error !== '等待选择超时') {
  console.log('DIALOG FAILED TO START')
  process.exitCode = 1
} else {
  console.log('dialog started and was cancelled by the probe (expected)')
}
