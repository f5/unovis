// Runtime smoke test of the MEASURED bundles: loads every <dir>/<id>.js listed in <dir>/variants.tsv
// in headless Chrome (driven over the DevTools protocol, no extra dependencies), checks that it runs
// without errors and draws something, moves a real (trusted) mouse over the plot to trigger the
// tooltip, and saves a screenshot to verify/screenshots/<id>.png.
// Usage: node verify/verify.mjs [dist]      (CHROME=/path/to/chrome to override the browser)
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'

const verifyDir = path.dirname(new URL(import.meta.url).pathname)
const root = path.dirname(verifyDir)
const outDir = process.argv[2] ?? 'dist'
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// "Context" rows (React itself, the AG Charts import-only probe) are not charts
const ids = fs.readFileSync(path.join(root, outDir, 'variants.tsv'), 'utf8').trim().split('\n').map((l) => l.split('\t')).filter(([, group]) => group !== 'Context').map(([id]) => id)

// 1. Test-only React ESM facades for the import map
await import('./build-vendor.mjs')

// 2. Static file server rooted at the bundle-size directory
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css' }
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://localhost').pathname))
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404)
    res.end()
    return
  }
  res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`

// 3. Headless Chrome + a minimal DevTools-protocol client (Node >= 22 has a global WebSocket)
const profileDir = path.join(verifyDir, '.chrome-profile')
const chrome = spawn(CHROME, [
  '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profileDir}`,
  '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] })
const wsUrl = await new Promise((resolve, reject) => {
  let stderr = ''
  chrome.stderr.on('data', (chunk) => {
    stderr += chunk
    const match = stderr.match(/DevTools listening on (ws:\/\/\S+)/)
    if (match) resolve(match[1])
  })
  chrome.on('exit', (code) => reject(new Error(`Chrome exited with ${code}:\n${stderr}`)))
})
const ws = new WebSocket(wsUrl)
await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }))
let lastId = 0
const pending = new Map()
const eventListeners = new Set()
ws.addEventListener('message', ({ data }) => {
  const msg = JSON.parse(data)
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id)
    pending.delete(msg.id)
    if (msg.error) reject(new Error(msg.error.message))
    else resolve(msg.result)
  } else if (msg.method) {
    for (const listener of eventListeners) listener(msg)
  }
})
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const id = ++lastId
  pending.set(id, { resolve, reject })
  ws.send(JSON.stringify({ id, method, params, sessionId }))
})
const evaluate = async (sessionId, expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId)).result.value

// Collected in the page. "Series A/B/C" are the series labels from src/shared/data.js.
const STATS = `(() => {
  const app = document.getElementById('app')
  const canvases = [...app.querySelectorAll('canvas')]
  let paintedPixels = 0
  let pixelSum = 0
  for (const c of canvases) {
    const ctx = c.width && c.height ? c.getContext('2d') : null
    if (!ctx) continue
    const { data } = ctx.getImageData(0, 0, c.width, c.height)
    for (let i = 0; i < data.length; i += 4) if (data[i + 3]) { paintedPixels++; pixelSum = (pixelSum + data[i] * 3 + data[i + 1] * 5 + data[i + 2] * 7) % 1000000007 }
  }
  const text = document.body.innerText
  const count = (s) => text.split(s).length - 1
  return {
    loaded: !!window.__loaded,
    pageErrors: window.__errors,
    requireShimUsed: window.__requireShimUsed,
    svgElements: app.querySelectorAll('svg').length,
    svgPaths: app.querySelectorAll('svg path').length,
    canvases: canvases.length,
    paintedPixels,
    pixelSum,
    seriesLabelsVisibleInDom: ['Series A', 'Series B', 'Series C'].map(count),
    appHeight: Math.round(app.getBoundingClientRect().height),
  }
})()`

const results = []
const screenshotDir = path.join(verifyDir, 'screenshots', outDir)
fs.mkdirSync(screenshotDir, { recursive: true })
for (const id of ids) {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const consoleMessages = []
  const listener = (msg) => {
    if (msg.sessionId !== sessionId) return
    if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning', 'assert'].includes(msg.params.type)) {
      consoleMessages.push(`console.${msg.params.type}: ${msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ')}`.slice(0, 400))
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails
      consoleMessages.push(`exception: ${d.exception?.description ?? d.text}`.slice(0, 400))
    }
  }
  eventListeners.add(listener)
  await send('Runtime.enable', {}, sessionId)
  await send('Page.enable', {}, sessionId)
  await send('Emulation.setDeviceMetricsOverride', { width: 860, height: 520, deviceScaleFactor: 1, mobile: false }, sessionId)
  await send('Page.navigate', { url: `${origin}/verify/index.html?id=${encodeURIComponent(id)}&dir=${encodeURIComponent(outDir)}` }, sessionId)
  await sleep(3500) // load + enter animations

  const before = await evaluate(sessionId, STATS)
  // Real mouse moves across the middle of the chart (a few steps so every library sees a move)
  const box = await evaluate(sessionId, `(() => { const r = document.getElementById('app').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()`)
  for (const dx of [-60, -30, -10, 0]) {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: box.x + dx, y: box.y }, sessionId)
    await sleep(120)
  }
  await sleep(1200)
  const after = await evaluate(sessionId, STATS)
  const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId)
  fs.writeFileSync(path.join(screenshotDir, `${id}.png`), Buffer.from(shot.data, 'base64'))
  eventListeners.delete(listener)
  await send('Target.closeTarget', { targetId })

  const drew = after.svgPaths > 0 || after.paintedPixels > 0
  const hoverChangedDom = after.seriesLabelsVisibleInDom.some((n, i) => n > before.seriesLabelsVisibleInDom[i])
  const hoverChangedCanvas = after.canvases > 0 && after.pixelSum !== before.pixelSum
  const ok = after.loaded && after.pageErrors.length === 0 && !consoleMessages.some((m) => m.startsWith('exception') || m.startsWith('console.error')) && drew
  results.push({ id, ok, drew, hoverChangedDom, hoverChangedCanvas, before, after, consoleMessages })
  const notes = [
    ...after.pageErrors.map((e) => `page error: ${e}`),
    ...(after.requireShimUsed.length ? [`bundle require()s externals from CommonJS code: ${after.requireShimUsed.join(', ')}`] : []),
    ...consoleMessages,
  ]
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id.padEnd(18)} svg paths ${String(after.svgPaths).padStart(4)} | canvases ${after.canvases} painted px ${String(after.paintedPixels).padStart(7)} | labels in DOM before/after hover ${before.seriesLabelsVisibleInDom.join('/')} -> ${after.seriesLabelsVisibleInDom.join('/')} | hover changed canvas: ${hoverChangedCanvas} | height ${after.appHeight}px${notes.length ? `\n     ${notes.join('\n     ')}` : ''}`)
}

fs.writeFileSync(path.join(verifyDir, `results-${outDir}.json`), JSON.stringify(results, null, 2))
ws.close()
await new Promise((resolve) => {
  chrome.once('exit', resolve)
  chrome.kill()
})
fs.rmSync(profileDir, { recursive: true, force: true }) // throwaway Chrome profile created above
server.close()
process.exit(results.every((r) => r.ok) ? 0 : 1)
