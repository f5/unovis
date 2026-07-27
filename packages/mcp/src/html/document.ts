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

import type { ChartSpec } from '../render/spec.js'

let cachedBundle: string | undefined

/** The compiled widget bundle (built by scripts/build-widget.mjs) */
export function widgetBundle (): string {
  if (cachedBundle) return cachedBundle
  // Resolve relative to this module so it works from dist/ and from src/
  const candidates = [
    new URL('../widget/bundle.js', import.meta.url),
    new URL('../../dist/widget/bundle.js', import.meta.url),
  ]
  for (const candidate of candidates) {
    try {
      cachedBundle = readFileSync(fileURLToPath(candidate), 'utf8')
      return cachedBundle
    } catch { /* try the next candidate */ }
  }
  throw new Error('Widget bundle not found — run `pnpm build:widget`')
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
<script>${widgetBundle()}</script>
</body>
</html>
`
}

/** A page that renders whatever spec it is sent over postMessage.
 * Protocol: iframe posts `unovis:ready`, host posts `unovis:render` with a
 * spec, iframe posts `unovis:size` after each render. */
export function buildEmbedDocument (): string {
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
<script>${widgetBundle()}</script>
<script>window.UnovisChart.startEmbed()</script>
</body>
</html>
`
}
