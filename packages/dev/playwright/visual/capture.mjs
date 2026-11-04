/* Captures every dev example in capture mode (`?capture=1`: seeded data, fixed clock, no
 * animation, fixed frame) from a served build and writes one PNG per example plus a
 * manifest.json describing what was captured and what failed. Pair two output directories
 * with compare.mjs to find visual changes between builds.
 *
 * Run: pnpm visual:capture --out <dir> [--serve <dist dir> | --base-url http://localhost:9501]
 *      [--theme light|dark] [--width <px> --height <px>] [--workers 4] [--filter <substring of "Category/Title">]
 * `--serve` serves a built dist directory on the base URL's port for the duration of the run;
 * without it the build must already be served (`pnpm serve` after `pnpm build`). Width and
 * height default to the app's own capture defaults (`src/capture/constants.ts`).
 */
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { chromium } from '@playwright/test'

import { listExamples } from './examples.mjs'
import {
  CHROMIUM_ARGS,
  DEFAULT_BASE_URL,
  DEFAULT_THEME,
  DEFAULT_WORKERS,
  MANIFEST_FILE,
  NAVIGATION_TIMEOUT_MS,
  READY_TIMEOUT_MS,
  SERVER_START_TIMEOUT_MS,
  VIEWPORT,
} from './constants.mjs'

const { values: args } = parseArgs({
  options: {
    out: { type: 'string' },
    serve: { type: 'string' },
    'base-url': { type: 'string', default: DEFAULT_BASE_URL },
    theme: { type: 'string', default: DEFAULT_THEME },
    width: { type: 'string' },
    height: { type: 'string' },
    workers: { type: 'string', default: String(DEFAULT_WORKERS) },
    filter: { type: 'string' },
  },
})
if (!args.out) {
  console.error('Usage: capture.mjs --out <dir> [--serve <dist dir> | --base-url <url>] [--theme light|dark] [--width <px> --height <px>] [--workers <n>] [--filter <text>]')
  process.exit(2)
}

const outDir = resolve(args.out)
const size = args.width && args.height ? { width: Number(args.width), height: Number(args.height) } : undefined
const sizeParams = size ? `&width=${size.width}&height=${size.height}` : ''
const viewport = { width: Math.max(VIEWPORT.width, size?.width ?? 0), height: Math.max(VIEWPORT.height, size?.height ?? 0) }
const theme = args.theme === 'dark' ? 'dark' : 'light'
const workers = Math.max(1, Number(args.workers) || DEFAULT_WORKERS)
const baseUrl = args['base-url'].replace(/\/$/, '')

const examples = listExamples().filter(example => !args.filter || `${example.category}/${example.title}`.toLowerCase().includes(args.filter.toLowerCase()))
if (!examples.length) {
  console.error(`No examples match "${args.filter}"`)
  process.exit(2)
}
mkdirSync(outDir, { recursive: true })

/** Serve a built dist directory with the `serve` package (the same server as `pnpm serve`)
 * until the captures are done; resolves once it answers on the base URL */
async function startServer (dist) {
  const require = createRequire(import.meta.url)
  const servePackage = require.resolve('serve/package.json')
  const bin = join(dirname(servePackage), require(servePackage).bin.serve)
  const port = new URL(baseUrl).port || '80'
  const server = spawn(process.execPath, [bin, resolve(dist), '-s', '-l', port, '--no-request-logging'], { stdio: ['ignore', 'ignore', 'inherit'] })
  const deadline = Date.now() + SERVER_START_TIMEOUT_MS
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`serve exited with code ${server.exitCode}`)
    const ok = await fetch(`${baseUrl}/`).then(response => response.ok, () => false)
    if (ok) return server
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  server.kill()
  throw new Error(`${baseUrl} did not answer within ${SERVER_START_TIMEOUT_MS}ms`)
}

const server = args.serve ? await startServer(args.serve) : undefined
process.on('exit', () => server?.kill()) // also on an uncaught error
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => process.exit(130)) // so `exit` fires on Ctrl-C too

const frameSelector = '[data-testid="example-capture"]'

/** Capture one example: ready → screenshot, error/timeout → recorded with the frame's own reason */
async function captureExample (context, example) {
  const url = `${baseUrl}${example.route}?capture=1&theme=${theme}${sizeParams}`
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  const started = Date.now()
  const result = { ...example, url, status: 'ok', message: '', consoleErrors, durationMs: 0, image: `${example.slug}.png` }
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT_MS })
    const frame = page.locator(frameSelector)
    await frame.waitFor({ state: 'attached', timeout: READY_TIMEOUT_MS })
    await page.waitForFunction(selector => {
      const element = document.querySelector(selector)
      return Boolean(element && (element.dataset.captureReady === 'true' || element.dataset.captureError))
    }, frameSelector, { timeout: READY_TIMEOUT_MS })
    const error = await frame.getAttribute('data-capture-error')
    if (error) {
      result.status = 'error'
      result.message = error
    } else {
      await frame.screenshot({ path: join(outDir, result.image), animations: 'disabled', caret: 'hide' })
    }
  } catch (error) {
    const pending = await page.locator(frameSelector).getAttribute('data-capture-pending').catch(() => null)
    result.status = 'timeout'
    result.message = pending ? `Never reported ready: ${pending}` : error.message.split('\n')[0]
  } finally {
    result.durationMs = Date.now() - started
    await page.close()
  }
  if (result.status !== 'ok') delete result.image
  return result
}

const browser = await chromium.launch({ args: CHROMIUM_ARGS })
const queue = [...examples]
const results = []
await Promise.all(Array.from({ length: Math.min(workers, queue.length) }, async () => {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  for (let example = queue.shift(); example; example = queue.shift()) {
    const result = await captureExample(context, example)
    results.push(result)
    console.error(`${result.status === 'ok' ? '✓' : '✗'} ${example.category} / ${example.title} (${result.durationMs}ms)${result.message ? ` — ${result.message}` : ''}`)
  }
  await context.close()
}))
await browser.close()
server?.kill() // the child would otherwise keep the process alive

results.sort((a, b) => a.slug.localeCompare(b.slug))
const manifest = { createdAt: new Date().toISOString(), baseUrl, theme, size, examples: results }
writeFileSync(join(outDir, MANIFEST_FILE), JSON.stringify(manifest, null, 2))

const failed = results.filter(result => result.status !== 'ok')
console.error(`\nCaptured ${results.length - failed.length}/${results.length} examples into ${outDir}`)
if (failed.length) {
  console.error('Not captured:')
  for (const result of failed) console.error(`  ${result.category} / ${result.title}: ${result.status} — ${result.message}`)
}
