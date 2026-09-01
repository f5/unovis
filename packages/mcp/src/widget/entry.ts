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
import { componentEvents } from './events.js'
import type { ChartEvent } from './events.js'
import { SPEC_VERSION } from '../render/spec.js'
import type { ChartSpec } from '../render/spec.js'

/** Error text comes from exceptions that can echo spec content, so it is
 * rendered as a text node rather than markup */
function showError (root: HTMLElement, message: string): void {
  const el = document.createElement('div')
  el.className = 'uv-error'
  el.textContent = message
  root.replaceChildren(el)
}

// Injected by scripts/build-widget.mjs; 'dev' when running unbundled (tests)
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __UNOVIS_MCP_VERSION__: string
// eslint-disable-next-line @typescript-eslint/naming-convention
const BUNDLE_VERSION = typeof __UNOVIS_MCP_VERSION__ !== 'undefined' ? __UNOVIS_MCP_VERSION__ : 'dev'

export interface RenderOptions {
  /** Animation duration in ms (0 disables animations) */
  duration?: number;
  /** Render the spec title as a heading above the chart */
  showTitle?: boolean;
  /** Receive clicks on chart elements (bars, segments, nodes…), normalized to
   * the caller's own data records. In embed mode, set `events: true` instead */
  onEvent?: (event: ChartEvent) => void;
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

  // Interaction events are widget behavior, not chart description, so they
  // merge into the components here rather than living in the spec
  const onEvent = options.onEvent
  if (onEvent) {
    spec = {
      ...spec,
      components: spec.components.map((component, i) => {
        const events = componentEvents(lib, component, i, onEvent)
        return events ? { ...component, config: { ...component.config, events } } : component
      }),
    }
  }

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
//                     { type: 'unovis:theme', theme }
// iframe → host:      { type: 'unovis:ready', version, specVersion },
//                     { type: 'unovis:size', width, height } and
//                     { type: 'unovis:event', … }

interface EmbedMessage {
  type?: string;
  spec?: ChartSpec;
  theme?: 'light' | 'dark';
  options?: RenderOptions & {
    /** Post `unovis:event` messages for clicks on chart elements */
    events?: boolean;
  };
}

/** JSON-RPC over postMessage, the MCP Apps (io.modelcontextprotocol/ui)
 * host protocol */
interface JsonRpcMessage {
  jsonrpc?: string;
  id?: number | string;
  method?: string;
  params?: {
    structuredContent?: { spec?: ChartSpec };
    hostContext?: { theme?: string };
  };
  result?: {
    hostContext?: { theme?: string };
  };
}

/** The MCP Apps extension revision this view implements */
const APPS_PROTOCOL_VERSION = '2026-01-26'
/** Fixed request id for the view-initiated ui/initialize */
const APPS_INIT_ID = 'unovis-ui-init'

/** React Native's WebView exposes its own bridge and only accepts strings */
interface ReactNativeWebViewBridge {
  postMessage: (data: string) => void;
}

function startEmbedMode (): void {
  const root = document.getElementById('uv-embed-root') ?? document.body
  let handle: ChartHandle | undefined
  let lastSpec: ChartSpec | undefined
  let lastOptions: EmbedMessage['options']
  let appsAnswered = false

  // In a React Native WebView the host listens on its own bridge, not on
  // window.parent — and receives strings, not structured clones
  const post = (message: Record<string, unknown>): void => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const bridge = (window as unknown as { ReactNativeWebView?: ReactNativeWebViewBridge }).ReactNativeWebView
    if (bridge) bridge.postMessage(JSON.stringify(message))
    else window.parent?.postMessage(message, '*')
  }

  const postSize = (): void => {
    post({ type: 'unovis:size', width: root.scrollWidth, height: root.scrollHeight })
    post({ jsonrpc: '2.0', method: 'ui/notifications/size-changed', params: { width: root.scrollWidth, height: root.scrollHeight } })
  }

  const renderMessage = (spec: ChartSpec, rawOptions: EmbedMessage['options']): void => {
    handle?.destroy()
    try {
      const { events, ...options } = rawOptions ?? {}
      if (events) {
        options.onEvent = (chartEvent) => post({ type: 'unovis:event', ...chartEvent })
      }
      handle = render(spec, root, options)
      lastSpec = spec
      lastOptions = rawOptions
      postSize()
    } catch (e) {
      showError(root, String(e instanceof Error ? e.message : e))
    }
  }

  // MCP Apps hosts speak JSON-RPC. The view initiates the lifecycle
  // (ui/initialize → host result → ui/notifications/initialized) — hosts MUST
  // NOT send tool data before the initialized notification arrives, so the
  // handshake is not optional. Returns true when the message was JSON-RPC.
  const applyHostTheme = (theme: string | undefined): void => {
    if (theme !== 'dark' && theme !== 'light') return
    if (lastSpec) renderMessage({ ...lastSpec, theme }, lastOptions)
    else applyTheme(theme)
  }

  const onJsonRpc = (message: JsonRpcMessage): boolean => {
    if (message.jsonrpc !== '2.0') return false

    // The host answered our ui/initialize: adopt its context, signal readiness
    if (message.id === APPS_INIT_ID && message.result) {
      appsAnswered = true
      applyHostTheme(message.result.hostContext?.theme)
      post({ jsonrpc: '2.0', method: 'ui/notifications/initialized' })
      return true
    }
    if (message.method === 'ui/notifications/tool-result') {
      const spec = message.params?.structuredContent?.spec
      // Results without a spec (static output types) leave the frame empty
      if (spec) renderMessage(spec, { events: true })
      return true
    }
    if (message.method === 'ui/notifications/host-context-changed') {
      applyHostTheme(message.params?.hostContext?.theme)
      return true
    }
    if (message.method === 'ping' && message.id !== undefined) {
      post({ jsonrpc: '2.0', id: message.id, result: {} })
      return true
    }
    return true // tool-input, tool-cancelled, other ui/*: acknowledged by ignoring
  }

  const onMessage = (event: Event): void => {
    // React Native posts strings; iframes post structured clones
    const raw = (event as MessageEvent<EmbedMessage | string>).data
    let message: EmbedMessage
    if (typeof raw === 'string') {
      try { message = JSON.parse(raw) as EmbedMessage } catch { return }
    } else {
      message = raw
    }
    if (onJsonRpc(message as JsonRpcMessage)) return

    if (message?.type === 'unovis:render' && message.spec) renderMessage(message.spec, message.options)

    // Theme flips shouldn't force the host to resend the spec (or reload the
    // document): re-render the last spec, or restyle the empty page
    if (message?.type === 'unovis:theme' && (message.theme === 'light' || message.theme === 'dark')) {
      if (lastSpec) renderMessage({ ...lastSpec, theme: message.theme }, lastOptions)
      else applyTheme(message.theme)
    }
  }

  // React Native delivers 'message' on document (Android) or window (iOS);
  // iframes always on window. Same handler everywhere.
  window.addEventListener('message', onMessage)
  document.addEventListener('message' as never, onMessage)

  // Version handshake: hosts that persist embed documents or specs assert
  // compatibility here instead of discovering drift as a blank chart
  post({ type: 'unovis:ready', version: BUNDLE_VERSION, specVersion: SPEC_VERSION })
  // MCP Apps lifecycle: view initiates. Retried briefly because a host may
  // attach its bridge after this document's scripts run; non-Apps hosts never
  // answer, and the retries stop on their own — harmless either way
  const postInitialize = (): void => post({
    jsonrpc: '2.0',
    id: APPS_INIT_ID,
    method: 'ui/initialize',
    params: {
      protocolVersion: APPS_PROTOCOL_VERSION,
      appInfo: { name: 'unovis-chart-widget', version: BUNDLE_VERSION },
      appCapabilities: {},
    },
  })
  postInitialize()
  let initializeAttempts = 0
  const initializeRetry = setInterval(() => {
    if (appsAnswered || ++initializeAttempts > 8) { clearInterval(initializeRetry); return }
    postInitialize()
  }, 500)
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
    showError(root, `Failed to render chart: ${String(e instanceof Error ? e.message : e)}`)
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
