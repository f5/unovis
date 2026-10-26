// Dev-only report for verifying how MapLibre (or any other library) starts its Web Workers, most useful together with
// `pnpm dev:gallery:csp` (whose CSP doesn't allow `blob:` workers). Records every `Worker` that gets created, whether its script failed to load, and every
// CSP violation, and shows them in a banner at the top of the page. The banner appears only once there is something to report,
// lists unique entries and hides after a few seconds; each unique violation is also logged to the console with the policy that fired it.
// The same data is exposed as `data-*` attributes on `#worker-report` so it can be asserted from automated browser checks.
const REPORT_ID = 'worker-report'
const HIDE_DELAY_MS = 4000

const workers: { url: string; failed: boolean }[] = []
const violations = new Map<string, number>()
let hideTimeout: number

const shortUrl = (url: string): string => (url.startsWith('blob:') ? 'blob:…' : url.replace(window.location.origin, ''))

const render = (): void => {
  let el = document.getElementById(REPORT_ID)
  if (!el) {
    el = document.createElement('div')
    el.id = REPORT_ID
    el.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:99999;max-width:560px;padding:8px 12px;border-radius:6px;font:12px/1.5 monospace;color:#fff;white-space:pre-wrap'
    document.body.appendChild(el)
  }

  const failedWorkers = workers.filter(w => w.failed).length
  const ok = !failedWorkers && !violations.size
  el.style.background = ok ? '#1b7f3b' : '#b3261e'
  el.style.display = ''
  el.dataset.workers = String(workers.length)
  el.dataset.workerErrors = String(failedWorkers)
  el.dataset.cspViolations = String(violations.size)
  el.dataset.status = ok ? 'ok' : 'failed'
  el.textContent = [
    `Workers: ${workers.length}, failed to load: ${failedWorkers}, CSP violations: ${violations.size} unique (details in console)`,
    ...[...new Set(workers.map(w => `${w.failed ? '✗' : '✓'} ${shortUrl(w.url)}`))],
    ...[...violations].map(([v, count]) => `✗ ${v}${count > 1 ? ` ×${count}` : ''}`),
  ].join('\n')

  // Hidden, not removed, so the `data-*` attributes stay available to automated checks
  window.clearTimeout(hideTimeout)
  hideTimeout = window.setTimeout(() => { el.style.display = 'none' }, HIDE_DELAY_MS)
}

const nativeWorker = window.Worker
window.Worker = class extends nativeWorker {
  constructor (scriptURL: string | URL, options?: WorkerOptions) {
    super(scriptURL, options)
    const record = { url: String(scriptURL), failed: false }
    workers.push(record)
    this.addEventListener('error', () => {
      record.failed = true
      render()
    })
    window.setTimeout(render, 0)
  }
}

document.addEventListener('securitypolicyviolation', e => {
  const key = `${e.violatedDirective}: ${shortUrl(e.blockedURI)}`
  const count = violations.get(key) ?? 0
  violations.set(key, count + 1)
  // `originalPolicy` tells whether the dev server's CSP fired, or another one (e.g. a browser extension's)
  if (!count) {
    console.warn(`[worker-report] CSP violation: ${key}`, {
      disposition: e.disposition,
      sourceFile: e.sourceFile,
      lineNumber: e.lineNumber,
      originalPolicy: e.originalPolicy,
    })
  }
  render()
})
