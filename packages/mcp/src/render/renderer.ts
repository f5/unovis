/** Spec-driven rendering: ChartSpec in, standalone SVG out.
 *
 * The headless mechanics (DOM, frame flushing, serialization) live in
 * headless.ts; this module only knows how to turn a spec into components.
 */
import { renderToSvg } from '@unovis/ssr'
import type { RenderResult } from '@unovis/ssr'
import { materializeChart, ChartInputError, ASYNC_COMPONENTS } from './materialize.js'
import type { ChartSpec, ComponentSpec } from './spec.js'

export { ChartInputError }

export interface RenderOptions {
  /** Deterministic id prefix (snapshot tests) */
  idPrefix?: string;
  /** Keep emotion classes / skip style inlining (debug) */
  keepClasses?: boolean;
}

export type { RenderResult } from '@unovis/ssr'

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
  const components = await resolveMapMarkers(spec.components)
  const needsAsyncLayout = components.some(c => ASYNC_COMPONENTS.has(c.type))

  return renderToSvg({
    width: spec.width,
    height: spec.height,
    theme: spec.theme,
    title: spec.title,
    legend: spec.legend,
    colors: spec.colors,
    idPrefix: options.idPrefix,
    keepClasses: options.keepClasses,
  }, (ctx) => {
    if (needsAsyncLayout) ctx.requireComponentReady()

    const materialized = materializeChart(ctx.unovis, { ...spec, components, width: ctx.width, height: ctx.height }, {
      duration: 0,
      onRenderComplete: ctx.onRenderComplete,
      onComponentComplete: ctx.onComponentReady,
    })

    return materialized.containerType === 'xy'
      ? new ctx.unovis.XYContainer(ctx.container, materialized.containerConfig, materialized.data as never[])
      : new ctx.unovis.SingleContainer(ctx.container, materialized.containerConfig, materialized.data)
  })
}
