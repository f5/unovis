/** Headless chart rendering — the SSR primitive.
 *
 * Everything here is independent of the MCP layer: give it a callback that
 * builds any Unovis chart and it returns standalone SVG. This is the boundary
 * a future `@unovis/ssr` package would follow.
 *
 * Why the callback receives `unovis` instead of importing it: the library
 * captures its environment at module load (emotion inserts stylesheets,
 * text measurement grabs a canvas context), so it must be imported *after*
 * the shims are installed. Handing the already-initialised namespace to the
 * callback is what makes that safe.
 */
import { getRenderEnv, defineElementSize } from './env/index.js'
import type { UnovisLib } from './env/index.js'
import { Mutex } from './mutex.js'
import { finalizeSvg, CHART_PADDING } from './svg/postprocess.js'
import type { SvgFrame } from './svg/postprocess.js'

const RENDER_TIMEOUT_MS = 5000
/** Async layouts (graph force/dagre/elk) may need dynamic imports + solver time */
const ASYNC_RENDER_TIMEOUT_MS = 20000
/** A synchronous render settles within a couple of frames; this only bounds
 * how long a broken one takes to report itself. Async renders are bounded by
 * the deadline instead — counting rounds is meaningless there, because a
 * microtask tick costs microseconds while a cold module import needs
 * milliseconds of real time. */
const MAX_FLUSH_ROUNDS = 10
/** Idle wait while an asynchronous layout is still pending */
const ASYNC_POLL_MS = 5
/** Extra settle passes after an async layout reports completion */
const ASYNC_GRACE_ROUNDS = 4

/** Renders share one jsdom document and one frame queue */
const mutex = new Mutex()

const nextMacrotask = (): Promise<void> => new Promise(resolve => setImmediate(resolve))

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

export interface HeadlessRenderOptions extends SvgFrame {
  /** Deterministic id prefix (snapshot tests); random per render otherwise */
  idPrefix?: string;
  /** Keep emotion classes and skip style inlining (debug) */
  keepClasses?: boolean;
  /** Frame drawn around the chart so content never touches the image edge.
   * The chart renders at width/height minus this padding. */
  padding?: { top: number; right: number; bottom: number; left: number };
}

/** Handed to the build callback. */
export interface BuildContext {
  /** Sized host element to render the chart into */
  container: HTMLElement;
  /** The shim-initialised @unovis/ts namespace — use this, don't import it */
  unovis: UnovisLib;
  /** Inner chart size (options size minus padding) */
  width: number;
  height: number;
  /** Pass as the container config's `onRenderComplete` */
  onRenderComplete: () => void;
  /** Pass as the `onRenderComplete` of components whose layout is async
   * (Graph), after calling `requireComponentReady()` */
  onComponentReady: () => void;
  /** Declare that a component signals readiness separately, so the render
   * waits for `onComponentReady` as well */
  requireComponentReady: () => void;
}

export interface RenderResult {
  svg: string;
  width: number;
  height: number;
  warnings: string[];
}

/** A chart instance, as returned by any Unovis container */
export interface RenderedChart {
  element?: Element | null;
  destroy?: () => void;
}

/**
 * Render a chart to standalone SVG in Node.
 *
 * ```ts
 * const { svg } = await renderToSvg({ width: 800, height: 400 }, (ctx) => {
 *   const line = new ctx.unovis.Line({ x: d => d.x, y: d => d.y, duration: 0 })
 *   return new ctx.unovis.XYContainer(ctx.container, {
 *     components: [line],
 *     width: ctx.width,
 *     height: ctx.height,
 *     duration: 0,
 *     onRenderComplete: ctx.onRenderComplete,
 *   }, data)
 * })
 * ```
 */
export async function renderToSvg (
  options: HeadlessRenderOptions,
  build: (context: BuildContext) => RenderedChart
): Promise<RenderResult> {
  const env = await getRenderEnv()
  return mutex.run(async () => {
    const { document, lib, raf } = env
    const warnings: string[] = []
    const padding = options.padding ?? CHART_PADDING
    const width = Math.max(40, options.width - padding.left - padding.right)
    const height = Math.max(40, options.height - padding.top - padding.bottom)
    const theme = options.theme ?? 'light'

    const host = document.createElement('div')
    defineElementSize(host, width, height)
    document.body.appendChild(host)

    // Theme and palette reach the library through the getComputedStyle shim:
    // the dark flag from the document root, palette overrides from the host's
    // inline custom properties.
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
    options.colors?.forEach((color, i) => {
      host.style.setProperty(`--vis-color${i}`, color)
      host.style.setProperty(`--vis-dark-color${i}`, color)
    })

    let renderCompleted = false
    let componentCompleted = true
    let needsComponent = false
    let chart: RenderedChart | undefined

    try {
      chart = build({
        container: host,
        unovis: lib,
        width,
        height,
        onRenderComplete: () => { renderCompleted = true },
        onComponentReady: () => { componentCompleted = true },
        requireComponentReady: () => {
          needsComponent = true
          componentCompleted = false
        },
      })

      // Belt and braces for library builds without the clientWidth fallback
      if (chart?.element) defineElementSize(chart.element, width, height)

      const deadline = Date.now() + (needsComponent ? ASYNC_RENDER_TIMEOUT_MS : RENDER_TIMEOUT_MS)
      let rounds = 0
      for (;;) {
        raf.flushAll()
        await nextMacrotask() // let 0ms timers (d3-timer) and layout promises progress
        if (raf.size === 0 && renderCompleted && componentCompleted) break
        if (Date.now() > deadline) break
        if (!needsComponent && ++rounds >= MAX_FLUSH_ROUNDS) break
        // Waiting on a layout that resolves through module loading and solver
        // work: yield real time rather than spinning on microtasks
        if (needsComponent && raf.size === 0 && !componentCompleted) await sleep(ASYNC_POLL_MS)
      }
      raf.flushAll()

      // Components with async layouts schedule follow-up frames *after*
      // signalling completion — graph fit-view, label placement. Without a
      // grace period the output depends on how loaded the machine is, which
      // shows up as charts that differ run to run.
      if (needsComponent) {
        for (let grace = 0; grace < ASYNC_GRACE_ROUNDS; grace++) {
          await sleep(ASYNC_POLL_MS)
          raf.flushAll()
        }
      }

      if (!renderCompleted || !componentCompleted) {
        const details = raf.errors.length ? ` Render errors: ${raf.errors.map(e => String(e)).join('; ')}` : ''
        const what = !renderCompleted
          ? 'onRenderComplete never fired — is it wired into the container config?'
          : 'component layout never completed'
        throw new Error(`Chart rendering did not complete (${what}).${details}`)
      }
      for (const error of raf.errors) warnings.push(`render frame error: ${String(error)}`)

      const svgElement = (chart?.element?.localName === 'svg'
        ? chart.element
        : host.querySelector('svg')) as SVGSVGElement | null
      if (!svgElement) throw new Error('Chart produced no SVG element')

      const svg = finalizeSvg(svgElement, {
        document,
        frame: { ...options, theme },
        varMaps: env.varMaps,
        idPrefix: options.idPrefix,
        keepClasses: options.keepClasses,
        padding,
      })

      return {
        svg,
        width: options.width,
        height: parseFloat(svgElement.getAttribute('height') ?? '') || options.height,
        warnings,
      }
    } finally {
      try {
        chart?.destroy?.()
      } catch { /* a failed render may leave a partially constructed chart */ }
      host.remove()
      if (theme === 'dark') document.documentElement.removeAttribute('data-theme')
      raf.clear()
    }
  })
}
