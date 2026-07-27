/** Browser entry for the interactive chart widget.
 *
 * Renders the same JSON ChartSpec the static pipeline uses, through the same
 * materializer — one source of truth for spec → chart. Bundled by
 * scripts/build-widget.mjs into a standalone IIFE that exposes
 * `window.UnovisChart` and, in `#embed` mode, speaks a small postMessage
 * protocol so any page can host the widget in an iframe.
 */
import * as unovis from './unovis-slim.js'
import { materializeChart } from '../render/materialize.js'
import { buildInteractions } from './interactions.js'
import type { ChartSpec } from '../render/spec.js'

export interface RenderOptions {
  /** Animation duration in ms (0 disables animations) */
  duration?: number;
  /** Render the spec title as a heading above the chart */
  showTitle?: boolean;
}

export interface ChartHandle {
  destroy: () => void;
  /** The container element the chart was rendered into */
  element: HTMLElement;
}

const THEME_ATTR = 'data-theme'

function applyTheme (theme: 'light' | 'dark'): void {
  const root = document.documentElement
  if (theme === 'dark') root.setAttribute(THEME_ATTR, 'dark')
  else root.removeAttribute(THEME_ATTR)
}

function applyPalette (host: HTMLElement, colors?: string[]): void {
  colors?.forEach((color, i) => {
    host.style.setProperty(`--vis-color${i}`, color)
    host.style.setProperty(`--vis-dark-color${i}`, color)
  })
}

/** Render a ChartSpec into a container. Returns a handle for teardown. */
export function render (spec: ChartSpec, container: HTMLElement, options: RenderOptions = {}): ChartHandle {
  container.innerHTML = ''
  container.classList.add('uv-root')
  applyTheme(spec.theme)
  applyPalette(container, spec.colors)

  if (options.showTitle !== false && spec.title) {
    const heading = document.createElement('div')
    heading.className = 'uv-title'
    heading.textContent = spec.title
    container.appendChild(heading)
  }

  const lib = unovis as unknown as Record<string, unknown>
  const { containerConfig: interactionConfig, legendItems } = buildInteractions(lib, spec)

  let legend: { destroy?: () => void } | undefined
  if (legendItems?.length) {
    const legendEl = document.createElement('div')
    legendEl.className = 'uv-legend'
    container.appendChild(legendEl)
    legend = new unovis.BulletLegend(legendEl, { items: legendItems })
  }

  const chartEl = document.createElement('div')
  chartEl.className = 'uv-chart'
  container.appendChild(chartEl)

  const materialized = materializeChart(lib as never, spec, {
    duration: options.duration ?? 400,
    responsive: true,
  })
  const config = { ...materialized.containerConfig, ...interactionConfig }

  const chart = materialized.containerType === 'xy'
    ? new unovis.XYContainer(chartEl, config as never, materialized.data as never[])
    : new unovis.SingleContainer(chartEl, config as never, materialized.data as never)

  return {
    element: container,
    destroy: () => {
      try {
        (chart as unknown as { destroy: () => void }).destroy()
        legend?.destroy?.()
      } finally {
        container.innerHTML = ''
      }
    },
  }
}

// ── embed mode ──────────────────────────────────────────────────────────────
// Host page → iframe: { type: 'unovis:render', spec, options }
// iframe → host:      { type: 'unovis:ready' } and { type: 'unovis:size', height }

interface EmbedMessage {
  type?: string;
  spec?: ChartSpec;
  options?: RenderOptions;
}

function startEmbedMode (): void {
  const root = document.getElementById('uv-embed-root') ?? document.body
  let handle: ChartHandle | undefined

  const postSize = (): void => {
    window.parent?.postMessage({
      type: 'unovis:size',
      width: root.scrollWidth,
      height: root.scrollHeight,
    }, '*')
  }

  window.addEventListener('message', (event: MessageEvent<EmbedMessage>) => {
    const message = event.data
    if (message?.type !== 'unovis:render' || !message.spec) return
    handle?.destroy()
    try {
      handle = render(message.spec, root, message.options ?? {})
      postSize()
    } catch (e) {
      root.innerHTML = `<div class="uv-error">${String(e instanceof Error ? e.message : e)}</div>`
    }
  })

  window.parent?.postMessage({ type: 'unovis:ready' }, '*')
}

/** Render a spec embedded in the page as <script type="application/json" id="uv-spec"> */
function renderInlineSpec (): void {
  const specEl = document.getElementById('uv-spec')
  const optionsEl = document.getElementById('uv-options')
  const root = document.getElementById('uv-root')
  if (!specEl?.textContent || !root) return
  try {
    const options = optionsEl?.textContent ? JSON.parse(optionsEl.textContent) as RenderOptions : {}
    render(JSON.parse(specEl.textContent) as ChartSpec, root, options)
  } catch (e) {
    root.innerHTML = `<div class="uv-error">Failed to render chart: ${String(e instanceof Error ? e.message : e)}</div>`
  }
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    UnovisChart: { render: typeof render; startEmbed: typeof startEmbedMode; unovis: typeof unovis };
  }
}

window.UnovisChart = { render, startEmbed: startEmbedMode, unovis }

if (window.location.hash === '#embed') startEmbedMode()
else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderInlineSpec)
else renderInlineSpec()
