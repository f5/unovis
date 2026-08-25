/* Host-side harness for the browser smoke lane: embeds the widget document in
 * a sandboxed iframe and drives it through the REAL MCP Apps lifecycle using
 * the official AppBridge — the same code actual hosts embed. If our view-side
 * handshake is wrong in any way, `initialized` never fires and the lane fails.
 *
 * Bundled at smoke-lane runtime by scripts/browser-smoke.mjs.
 */
// eslint-disable-next-line import/no-unresolved -- subpath export, resolved by esbuild at bundle time
import { AppBridge, PostMessageTransport } from '@modelcontextprotocol/ext-apps/app-bridge'

declare global {
  /* eslint-disable @typescript-eslint/naming-convention -- harness globals read by Playwright */
  interface Window {
    __EMBED_HTML: string;
    __SPEC: Record<string, unknown>;
    __hostState: { initialized: boolean; sizeChanged: boolean; errors: string[] };
  }
  /* eslint-enable @typescript-eslint/naming-convention */
}

window.__hostState = { initialized: false, sizeChanged: false, errors: [] }

const iframe = document.createElement('iframe')
iframe.id = 'app'
// The sandbox real hosts use: scripts only, no same-origin escape
iframe.setAttribute('sandbox', 'allow-scripts')
iframe.style.cssText = 'width: 900px; height: 600px; border: 0;'
iframe.srcdoc = window.__EMBED_HTML
document.body.appendChild(iframe)

const bridge = new AppBridge(null, { name: 'unovis-smoke-host', version: '0.0.0' }, {})

bridge.addEventListener('sizechange', () => { window.__hostState.sizeChanged = true })
bridge.addEventListener('initialized', () => {
  window.__hostState.initialized = true
  // A conforming host sends tool data only after `initialized`
  bridge.sendToolInput({ arguments: {} }).catch(() => undefined)
  bridge.sendToolResult({
    content: [{ type: 'text', text: 'Interactive chart' }],
    structuredContent: { spec: window.__SPEC },
  }).catch(() => undefined)
})

// Connect immediately (the documented host pattern): the transport must be
// listening before the iframe's scripts run, or the view's initialize is lost
const transport = new PostMessageTransport(iframe.contentWindow!, iframe.contentWindow!)
bridge.connect(transport).catch((error) => window.__hostState.errors.push(String(error)))
