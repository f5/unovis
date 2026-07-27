/** Chart rendering pipeline.
 *
 * One shared jsdom + one library import per process; renders are serialized
 * with a mutex (the rAF queue and document are shared state). Each render
 * uses a fresh host <div> and destroys the chart afterwards.
 */
import { getRenderEnv, defineElementSize } from '../env/index.js'
import type { RenderEnv } from '../env/index.js'
import { materializeChart, ChartInputError, ASYNC_COMPONENTS } from './materialize.js'
import { Mutex } from './mutex.js'
import { finalizeSvg, CHART_PADDING } from '../svg/postprocess.js'
import type { ChartSpec, ComponentSpec } from './spec.js'

export { ChartInputError }

export interface RenderOptions {
  /** Deterministic id prefix (snapshot tests) */
  idPrefix?: string;
  /** Keep emotion classes / skip style inlining (debug) */
  keepClasses?: boolean;
}

export interface RenderResult {
  svg: string;
  width: number;
  height: number;
  warnings: string[];
}

const RENDER_TIMEOUT_MS = 5000
/** Async layouts (graph force/dagre/elk) may need dynamic imports + solver time */
const ASYNC_RENDER_TIMEOUT_MS = 20000
const MAX_FLUSH_ROUNDS = 10
const MAX_ASYNC_FLUSH_ROUNDS = 2000

const mutex = new Mutex()

const nextMacrotask = (): Promise<void> => new Promise(resolve => setImmediate(resolve))

/** Unovis map names accepted in `{ $unovisMap: name }` config markers */
const UNOVIS_MAPS = new Set([
  'WorldMapTopoJSON', 'WorldMapSimplestTopoJSON', 'WorldMap110mAlphaTopoJSON',
  'USATopoJSON', 'USCountiesTopoJSON', 'GermanyTopoJSON', 'UKTopoJSON',
  'FranceTopoJSON', 'IndiaTopoJSON', 'ChinaTopoJSON',
])

/** Resolve `{ $unovisMap: name }` markers to lazily-imported TopoJSON data
 * (the map bundles are large — only loaded when a map chart renders) and
 * default `mapFeatureName` to the map's feature collection key. */
export async function resolveMapMarkers (components: ComponentSpec[]): Promise<ComponentSpec[]> {
  return Promise.all(components.map(async (component) => {
    const marker = (component.config.topojson as { $unovisMap?: string } | undefined)?.$unovisMap
    if (!marker) return component
    if (!UNOVIS_MAPS.has(marker)) throw new ChartInputError(`Unknown Unovis map: ${marker}`)
    // Explicit extension: @unovis/ts has no exports map, and ESM does not
    // append .js to bare subpath imports (only the tsx loader tolerates it)
    const maps = await import('@unovis/ts/maps.js') as Record<string, { objects: Record<string, unknown> }>
    const topojson = maps[marker]
    if (!topojson) throw new ChartInputError(`Map ${marker} is not available in this @unovis/ts build`)
    return {
      ...component,
      config: {
        ...component.config,
        topojson,
        mapFeatureName: component.config.mapFeatureName ?? Object.keys(topojson.objects)[0],
      },
    }
  }))
}

export async function renderChart (spec: ChartSpec, options: RenderOptions = {}): Promise<RenderResult> {
  const env = await getRenderEnv()
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return mutex.run(() => renderInEnv(env, spec, options))
}

async function renderInEnv (env: RenderEnv, spec: ChartSpec, options: RenderOptions): Promise<RenderResult> {
  const { document, lib, raf } = env
  const warnings: string[] = []

  // The chart renders at the inner size; the post-processor frames it with
  // CHART_PADDING so content never touches the image edges while width and
  // height stay the final image dimensions.
  const inner: ChartSpec = {
    ...spec,
    width: Math.max(40, spec.width - CHART_PADDING.left - CHART_PADDING.right),
    height: Math.max(40, spec.height - CHART_PADDING.top - CHART_PADDING.bottom),
  }

  const host = document.createElement('div')
  defineElementSize(host, inner.width, inner.height)
  document.body.appendChild(host)

  // Theme + custom palette apply through the getComputedStyle wrapper:
  // the dark flag is read from the document root, palette overrides from
  // the host's inline custom properties.
  if (spec.theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
  spec.colors?.forEach((color, i) => {
    host.style.setProperty(`--vis-color${i}`, color)
    host.style.setProperty(`--vis-dark-color${i}`, color)
  })

  // Components with async layouts (Graph) signal readiness through their own
  // onRenderComplete — the container's fires before layout finishes.
  const needsComponentComplete = spec.components.some(c => ASYNC_COMPONENTS.has(c.type))

  let renderCompleted = false
  let componentCompleted = !needsComponentComplete
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let chart: any
  try {
    const resolvedInner: ChartSpec = { ...inner, components: await resolveMapMarkers(inner.components) }
    const materialized = materializeChart(lib, resolvedInner, {
      duration: 0,
      onRenderComplete: () => { renderCompleted = true },
      onComponentComplete: () => { componentCompleted = true },
    })

    chart = materialized.containerType === 'xy'
      ? new lib.XYContainer(host, materialized.containerConfig, materialized.data as never[])
      : new lib.SingleContainer(host, materialized.containerConfig, materialized.data)

    // Belt and braces for lib builds without the clientWidth fallback
    if (chart.element) defineElementSize(chart.element, inner.width, inner.height)

    const deadline = Date.now() + (needsComponentComplete ? ASYNC_RENDER_TIMEOUT_MS : RENDER_TIMEOUT_MS)
    const maxRounds = needsComponentComplete ? MAX_ASYNC_FLUSH_ROUNDS : MAX_FLUSH_ROUNDS
    for (let round = 0; round < maxRounds; round++) {
      raf.flushAll()
      await nextMacrotask() // let 0ms timers (d3-timer) and layout promises progress
      if (raf.size === 0 && renderCompleted && componentCompleted) break
      if (Date.now() > deadline) break
    }
    raf.flushAll()

    if (!renderCompleted || !componentCompleted) {
      const details = raf.errors.length ? ` Render errors: ${raf.errors.map(e => String(e)).join('; ')}` : ''
      const what = !renderCompleted ? 'onRenderComplete never fired' : 'component layout never completed'
      throw new Error(`Chart rendering did not complete (${what}).${details}`)
    }
    for (const error of raf.errors) warnings.push(`render frame error: ${String(error)}`)

    const svgElement = (chart.element?.localName === 'svg' ? chart.element : host.querySelector('svg')) as SVGSVGElement | null
    if (!svgElement) throw new Error('Chart produced no SVG element')

    const svg = finalizeSvg(svgElement, {
      document,
      spec,
      varMaps: env.varMaps,
      idPrefix: options.idPrefix,
      keepClasses: options.keepClasses,
    })

    const width = parseFloat(svgElement.getAttribute('width') ?? '') || spec.width
    const height = parseFloat(svgElement.getAttribute('height') ?? '') || spec.height
    return { svg, width, height, warnings }
  } finally {
    try {
      chart?.destroy()
    } catch { /* a failed render may leave a partially constructed chart */ }
    host.remove()
    if (spec.theme === 'dark') document.documentElement.removeAttribute('data-theme')
    raf.clear()
  }
}
