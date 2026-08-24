/** Default interactivity for rendered charts.
 *
 * Static output can't carry behavior, so interactive charts get sensible
 * defaults derived from the same ChartSpec: hover tooltips per chart type,
 * a crosshair on continuous XY charts, and — unlike SVG output — Unovis's
 * real HTML BulletLegend.
 */
import { formatNumTick, materializeValue } from '../render/materialize.js'
import type { AccessorRef, ChartSpec } from '../render/spec.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Lib = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Datum = Record<string, any>

const escapeHtml = (value: unknown): string => String(value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const formatValue = (value: unknown, locale?: string): string => {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'number') return formatNumTick(value, locale)
  return escapeHtml(value)
}

const row = (label: string, value: unknown, locale?: string): string =>
  `<div class="uv-tt-row"><span class="uv-tt-key">${escapeHtml(label)}</span><span class="uv-tt-val">${formatValue(value, locale)}</span></div>`

const title = (text: unknown): string => `<div class="uv-tt-title">${escapeHtml(text)}</div>`

/** Field names referenced by a component config, in declaration order —
 * used to show the fields the chart actually plots, not every data column. */
function specFields (config: Record<string, unknown>): string[] {
  const fields: string[] = []
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(walk)
      return
    }
    if (typeof value === 'object' && value !== null) {
      const ref = value as { $field?: string }
      if (typeof ref.$field === 'string') {
        if (!fields.includes(ref.$field)) fields.push(ref.$field)
        return
      }
      Object.values(value).forEach(walk)
    }
  }
  walk(config)
  return fields
}

/** Records carry internal Unovis state under `_`-prefixed keys */
const publicEntries = (datum: Datum): [string, unknown][] =>
  Object.entries(datum ?? {}).filter(([key, value]) =>
    !key.startsWith('_') && (value === null || typeof value !== 'object'))

function recordTooltip (fields: string[], labelField?: string, locale?: string): (d: Datum) => string {
  return (d: Datum) => {
    if (!d) return ''
    const head = labelField && d[labelField] !== undefined ? title(d[labelField]) : ''
    const shown = fields.length
      ? fields.filter(f => d[f] !== undefined).map(f => row(f, d[f], locale))
      : publicEntries(d).map(([key, value]) => row(key, value, locale))
    return `${head}${shown.join('')}` || title('no data')
  }
}

export interface Interactions {
  /** Container-level configs to merge in */
  containerConfig: Record<string, unknown>;
  /** Legend items for the HTML BulletLegend, when the spec declares any */
  legendItems?: { name: string; color?: string }[];
}

/** Build tooltip/crosshair configs plus legend items for a spec */
export function buildInteractions (lib: Lib, spec: ChartSpec): Interactions {
  const containerConfig: Record<string, unknown> = {}
  const triggers: Record<string, (d: Datum) => string> = {}

  for (const component of spec.components) {
    const fields = specFields(component.config)
    const generic = recordTooltip(fields, undefined, spec.locale)

    switch (component.type) {
      case 'Line':
      case 'Area':
        // Lines/areas are covered by the crosshair below; hovering the shape
        // itself has no single datum
        break
      case 'GroupedBar':
      case 'StackedBar': {
        const cls = component.type === 'StackedBar' ? lib.StackedBar : lib.GroupedBar
        triggers[cls.selectors.bar] = generic
        break
      }
      case 'Scatter':
        triggers[lib.Scatter.selectors.point] = generic
        break
      case 'Boxplot':
        triggers[lib.Boxplot.selectors.box] = generic
        break
      case 'Timeline':
        triggers[lib.Timeline.selectors.line] = generic
        break
      case 'Donut':
        triggers[lib.Donut.selectors.segment] = (d: Datum) => generic(d?.data ?? d)
        break
      case 'NestedDonut':
        triggers[lib.NestedDonut.selectors.segment] = (d: Datum) =>
          `${title(d?.data?.key ?? '')}${row('value', d?.value ?? d?.data?.value)}`
        break
      case 'RadialBar':
        triggers[lib.RadialBar.selectors.segment] = (d: Datum) => generic(d?.data ?? d)
        break
      case 'Heatmap':
        triggers[lib.Heatmap.selectors.node] = generic
        break
      case 'Treemap':
        triggers[lib.Treemap.selectors.tile] = (d: Datum) =>
          `${title(d?.data?.key ?? d?.key ?? '')}${row('value', d?.value)}`
        break
      case 'Sankey':
        triggers[lib.Sankey.selectors.node] = (d: Datum) =>
          `${title(d?.label ?? d?.id ?? '')}${row('total', d?.value)}`
        triggers[lib.Sankey.selectors.link] = (d: Datum) =>
          `${title(`${d?.source?.label ?? d?.source?.id ?? ''} → ${d?.target?.label ?? d?.target?.id ?? ''}`)}${row('value', d?.value)}`
        break
      case 'ChordDiagram':
        triggers[lib.ChordDiagram.selectors.node] = (d: Datum) => title(d?.data?.label ?? d?.key ?? '')
        break
      case 'Graph':
        triggers[lib.Graph.selectors.node] = (d: Datum) => generic(d?._state ? d : d?.data ?? d)
        triggers[lib.Graph.selectors.link] = (d: Datum) =>
          title(`${d?.source?.id ?? ''} → ${d?.target?.id ?? ''}`)
        break
      case 'TopoJSONMap':
        triggers[lib.TopoJSONMap.selectors.feature] = (d: Datum) => {
          const area = d?.data ?? d
          if (!area?.id && !area?.name) return ''
          return `${title(area.name ?? area.id)}${area.value !== undefined ? row('value', area.value) : ''}`
        }
        break
    }
  }

  // Crosshair: continuous XY charts get a shared vertical readout
  const crosshairComponent = spec.components.find(c => c.type === 'Line' || c.type === 'Area')
  const usesCrosshair = spec.container === 'xy' && !!crosshairComponent

  // XYContainer renders the crosshair's readout through the container tooltip
  // (`crosshair.tooltip = tooltip`), so a crosshair needs one even when no
  // component has its own hover triggers — line/area charts hit exactly this.
  if (Object.keys(triggers).length || usesCrosshair) {
    containerConfig.tooltip = new lib.Tooltip({ triggers, horizontalPlacement: 'center' })
  }

  if (usesCrosshair && crosshairComponent) {
    const x = materializeValue(crosshairComponent.config.x as AccessorRef, spec.locale)
    const yFields = specFields(crosshairComponent.config)
      .filter(f => f !== (crosshairComponent.config.x as { $field?: string })?.$field)
    const labels = spec.legend?.map(item => item.name) ?? yFields
    const xField = (crosshairComponent.config.x as { $field?: string })?.$field
    // Format the header with the x axis's own tick formatter — the raw value
    // on a time axis is epoch milliseconds
    const headFormat = spec.xAxis?.tickFormat
      ? materializeValue(spec.xAxis.tickFormat, spec.locale) as (value: unknown) => string
      : undefined

    containerConfig.crosshair = new lib.Crosshair({
      x,
      // Crosshair places one marker per y accessor — without these it warns
      // and renders only the vertical line
      y: materializeValue(crosshairComponent.config.y, spec.locale),
      template: (d: Datum) => {
        const xValue = xField ? d?.[xField] : undefined
        const head = xValue !== undefined ? title(headFormat ? headFormat(xValue) : xValue) : ''
        const rows = yFields.map((f, i) => row(labels[i] ?? f, d?.[f], spec.locale))
        return `${head}${rows.join('')}`
      },
    })
  }

  const legendItems = spec.legend?.length
    ? spec.legend.map(item => ({ name: item.name, color: item.color }))
    : undefined

  return { containerConfig, legendItems }
}
