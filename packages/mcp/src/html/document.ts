/** Self-contained interactive chart documents.
 *
 * Emits one HTML file with the spec, the widget bundle and all styles inlined
 * — no network, no build step, opens anywhere. Two shapes:
 *
 *  - `buildChartDocument(spec)`: renders the spec on load (file deliverable)
 *  - `buildEmbedDocument()`: waits for a spec over postMessage (iframe/widget
 *    host, used for the ui:// resource and third-party embedding)
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

import type { ChartSpec } from '../render/spec.js'

const artifactCache = new Map<string, string>()

/** A compiled widget artifact (built by scripts/build-widget.mjs), resolved
 * relative to this module so it works from dist/ and from src/ */
function widgetArtifact (name: string): string {
  const cached = artifactCache.get(name)
  if (cached) return cached
  const candidates = [
    new URL(`../widget/${name}`, import.meta.url),
    new URL(`../../dist/widget/${name}`, import.meta.url),
  ]
  for (const candidate of candidates) {
    try {
      const content = readFileSync(fileURLToPath(candidate), 'utf8')
      artifactCache.set(name, content)
      return content
    } catch { /* try the next candidate */ }
  }
  throw new Error(`Widget artifact ${name} not found — run \`pnpm build:widget\``)
}

/** The compiled widget bundle */
export function widgetBundle (): string {
  return widgetArtifact('bundle.js')
}

/** The widget, inlined. Compressed by default: a standalone file never gets
 * transport compression, so the bundle ships as a gzip+base64 payload with a
 * ~5kB synchronous bootstrap ahead of it (~3× smaller documents). The spec
 * and styles stay plain text so committed artifacts remain readable and
 * diffable. */
function inlineWidget (compress: boolean): string {
  if (!compress) return `<script>${widgetBundle()}</script>`
  const key = 'bundle.js.gz64'
  let payload = artifactCache.get(key)
  if (!payload) {
    payload = gzipSync(Buffer.from(widgetBundle()), { level: 9 }).toString('base64')
    artifactCache.set(key, payload)
  }
  return `<script type="application/gzip" id="uv-bundle-gz">${payload}</script>
<script>${widgetArtifact('unpack.js')}</script>`
}

/** `</script` inside embedded JSON would close the host script element */
const escapeForScript = (json: string): string => json.replace(/</g, '\\u003c')

const FONT_STACK = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'

function styles (spec?: ChartSpec): string {
  const aspect = spec ? `${spec.width} / ${spec.height}` : '16 / 9'
  return `
  :root { --uv-bg: #ffffff; --uv-fg: #1f2937; --uv-muted: #6b7280; --uv-border: #e5e7eb; }
  :root[data-theme="dark"] { --uv-bg: #292b34; --uv-fg: #f2f4f9; --uv-muted: #aab2c0; --uv-border: #3a3d47; }
  html, body { margin: 0; padding: 0; background: var(--uv-bg); color: var(--uv-fg); font-family: ${FONT_STACK}; }
  body { padding: 16px; box-sizing: border-box; }
  .uv-root { display: flex; flex-direction: column; gap: 8px; max-width: 100%; }
  .uv-title { font-size: 16px; font-weight: 600; }
  .uv-legend { display: flex; flex-wrap: wrap; }
  .uv-chart { width: 100%; aspect-ratio: ${aspect}; min-height: 240px; }
  .uv-error { padding: 16px; border: 1px solid #e35a68; border-radius: 8px; color: #e35a68; font-family: ui-monospace, monospace; font-size: 13px; }
  /* Tooltip / crosshair content (Unovis provides the container chrome) */
  .uv-tt-title { font-weight: 600; margin-bottom: 4px; }
  .uv-tt-row { display: flex; gap: 12px; justify-content: space-between; font-size: 12px; line-height: 1.6; }
  .uv-tt-key { color: var(--uv-muted); }
  .uv-tt-val { font-variant-numeric: tabular-nums; font-weight: 500; }
  @media (max-width: 560px) { .uv-chart { aspect-ratio: 4 / 3; } }`
}

export interface ChartDocumentOptions {
  /** Document <title>; defaults to the spec title */
  documentTitle?: string;
  /** Animation duration in ms. 0 renders immediately (deterministic tests,
   * and useful when the chart is screenshotted right after load) */
  duration?: number;
  /** Inline the widget as a gzip+base64 payload with a self-extracting
   * bootstrap (default true). Set false for a plain-text bundle — e.g. when
   * a host page's CSP forbids injected script elements */
  compress?: boolean;
}

/** A standalone page that renders `spec` on load */
export function buildChartDocument (spec: ChartSpec, options: ChartDocumentOptions = {}): string {
  const title = options.documentTitle ?? spec.title ?? 'Unovis chart'
  return `<!doctype html>
<html lang="en"${spec.theme === 'dark' ? ' data-theme="dark"' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title.replace(/</g, '&lt;')}</title>
<style>${styles(spec)}</style>
</head>
<body>
<div id="uv-root"></div>
<script type="application/json" id="uv-spec">${escapeForScript(JSON.stringify(spec))}</script>
<script type="application/json" id="uv-options">${escapeForScript(JSON.stringify({ duration: options.duration ?? 400 }))}</script>
${inlineWidget(options.compress !== false)}
</body>
</html>
`
}

/** A page that renders whatever spec it is sent over postMessage.
 * Protocol: iframe posts `unovis:ready`, host posts `unovis:render` with a
 * spec, iframe posts `unovis:size` after each render. */
export interface EmbedDocumentOptions {
  /** See ChartDocumentOptions.compress (default true) */
  compress?: boolean;
}

export function buildEmbedDocument (options: EmbedDocumentOptions = {}): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Unovis chart</title>
<style>${styles()}
  body { padding: 8px; }
</style>
</head>
<body>
<div id="uv-embed-root"></div>
${inlineWidget(options.compress !== false)}
<script>window.UnovisChart.startEmbed()</script>
</body>
</html>
`
}
