/** Self-extracting bootstrap for compressed chart documents.
 *
 * The widget bundle compresses ~3× with gzip, but a standalone .html file is
 * never served with transport compression — so the document carries the
 * bundle as a gzip+base64 payload and this script (inlined ahead of it)
 * inflates and executes it.
 *
 * fflate's gunzipSync over the native DecompressionStream on purpose: it is
 * synchronous, so the bundle executes during parse exactly like an inline
 * script and every later <script> still sees `window.UnovisChart` — and it
 * behaves identically in browsers, WebViews and jsdom. The cost is ~8kB.
 */
import { gunzipSync, strFromU8 } from 'fflate'

const payload = document.getElementById('uv-bundle-gz')
if (payload?.textContent) {
  try {
    const b64 = payload.textContent.replace(/\s+/g, '')
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
    const source = strFromU8(gunzipSync(bytes))
    const script = document.createElement('script')
    script.textContent = source
    document.head.appendChild(script)
  } catch (e) {
    const el = document.createElement('div')
    el.className = 'uv-error'
    el.textContent = `Failed to unpack the chart bundle: ${String(e instanceof Error ? e.message : e)}`
    document.body.replaceChildren(el)
  }
}
