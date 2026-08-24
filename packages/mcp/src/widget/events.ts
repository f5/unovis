/** Interaction events for hosted widgets.
 *
 * The embed protocol was render-only: a host could show a chart but a tap on
 * a donut segment could reach nothing. When a host opts in, every element
 * that has a tooltip also reports clicks, normalized to the caller's own flat
 * data records — never Unovis's internal render wrappers.
 */
import type { ComponentSpec } from '../render/spec.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Lib = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Datum = Record<string, any>

/** What a host receives for one user interaction on a chart element */
export interface ChartEvent {
  /** Component type the element belongs to, e.g. "Donut" */
  component: string;
  /** Index of that component in the spec's components array */
  componentIndex: number;
  /** DOM event name — "click" (a tap, on touch devices) */
  event: string;
  /** The element's datum, reduced to JSON-safe fields of the caller's record */
  datum: unknown;
}

/** Keep only JSON-scalar fields — internal wrappers carry functions, DOM
 * nodes and circular state that must never cross postMessage. */
const flatRecord = (value: unknown): unknown => {
  if (value === null || typeof value !== 'object') return value
  const out: Record<string, unknown> = {}
  for (const [key, v] of Object.entries(value as Datum)) {
    if (key.startsWith('_')) continue
    if (v === null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') out[key] = v
  }
  return out
}

/** Per-type unwrap of Unovis's internal datum to the user's record — the same
 * shapes the tooltip templates in interactions.ts unwrap. */
const extractors: Record<string, (d: Datum) => unknown> = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  GroupedBar: d => flatRecord(d?.datum ?? d),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  StackedBar: d => flatRecord(d?.datum ?? d),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Scatter: d => flatRecord(d?.datum ?? d),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Boxplot: d => flatRecord(d?.datum ?? d),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Timeline: d => flatRecord(d?.datum ?? d),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Donut: d => flatRecord(d?.data ?? d),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  NestedDonut: d => ({ key: d?.data?.key, value: d?.value ?? d?.data?.value }),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  RadialBar: d => flatRecord(d?.data ?? d),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Heatmap: d => flatRecord(d?.datum ?? d),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Treemap: d => ({ key: d?.data?.key ?? d?.key, value: d?.value }),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Sankey: d => (d?.source || d?.target
    ? { source: d?.source?.label ?? d?.source?.id, target: d?.target?.label ?? d?.target?.id, value: d?.value }
    : { id: d?.id, label: d?.label, value: d?.value }),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ChordDiagram: d => ({ label: d?.data?.label ?? d?.key, value: d?.value ?? d?.data?.value }),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Graph: d => (d?.source || d?.target
    ? { source: d?.source?.id, target: d?.target?.id }
    : flatRecord(d?._state ? d : d?.data ?? d)),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  TopoJSONMap: d => flatRecord(d?.data ?? d),
}

/** CSS selectors of the clickable primitives per component type */
function clickableSelectors (lib: Lib, type: string): string[] {
  switch (type) {
    case 'GroupedBar': return [lib.GroupedBar.selectors.bar]
    case 'StackedBar': return [lib.StackedBar.selectors.bar]
    case 'Scatter': return [lib.Scatter.selectors.point]
    case 'Boxplot': return [lib.Boxplot.selectors.box]
    case 'Timeline': return [lib.Timeline.selectors.line]
    case 'Donut': return [lib.Donut.selectors.segment]
    case 'NestedDonut': return [lib.NestedDonut.selectors.segment]
    case 'RadialBar': return [lib.RadialBar.selectors.segment]
    case 'Heatmap': return [lib.Heatmap.selectors.node]
    case 'Treemap': return [lib.Treemap.selectors.tile]
    case 'Sankey': return [lib.Sankey.selectors.node, lib.Sankey.selectors.link]
    case 'ChordDiagram': return [lib.ChordDiagram.selectors.node]
    case 'Graph': return [lib.Graph.selectors.node, lib.Graph.selectors.link]
    case 'TopoJSONMap': return [lib.TopoJSONMap.selectors.feature]
    // Line/Area have no per-datum element — the crosshair reads them; a
    // future x-position event would live on the container, not the shapes
    default: return []
  }
}

/** Unovis `events` config for one component, or undefined when it has no
 * clickable primitives. Merged into the component config by the renderer. */
export function componentEvents (
  lib: Lib,
  component: ComponentSpec,
  componentIndex: number,
  onEvent: (event: ChartEvent) => void
): Record<string, Record<string, (d: Datum) => void>> | undefined {
  const selectors = clickableSelectors(lib, component.type)
  if (!selectors.length) return undefined
  const extract = extractors[component.type] ?? flatRecord

  const events: Record<string, Record<string, (d: Datum) => void>> = {}
  for (const selector of selectors) {
    events[selector] = {
      click: (d: Datum) => onEvent({
        component: component.type,
        componentIndex,
        event: 'click',
        datum: extract(d),
      }),
    }
  }
  return events
}
