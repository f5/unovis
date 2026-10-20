import { Scatter, TopoJSONMap } from '@unovis/ts'
import { WorldMapTopoJSON } from '@unovis/ts/maps'
import { data, DataRecord } from './data'

export const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
export const tooltipClassName = 'gallery-example-tooltip'


export type ExampleState = { minimum: string; half: string; selected: string }
export type UpdateState = (patch: Partial<ExampleState>) => void
export type DailyRecord = { time: number; count: number }
export type MapPoint = { properties: DataRecord }
export const initialState: ExampleState = { minimum: '5', half: 'all', selected: '' }
export const magnitudeOptions = [
  { value: '4.5', label: 'M4.5+' },
  { value: '5', label: 'M5.0+' },
  { value: '6', label: 'M6.0+' },
]
export const dateOptions = [
  { value: 'all', label: 'All January' },
  { value: 'first', label: '1–15 January' },
  { value: 'second', label: '16–31 January' },
]
export const chartMargin = { left: 60, right: 16, top: 8, bottom: 60 }
export const world = WorldMapTopoJSON
export const dayMilliseconds = 86400000
export const id = (d: DataRecord): string => d.id
export const latitude = (d: DataRecord): number => d.latitude
export const longitude = (d: DataRecord): number => d.longitude
export const depth = (d: DataRecord): number => d.depth
export const magnitude = (d: DataRecord): number => d.magnitude
export const day = (d: DailyRecord): number => d.time
export const count = (d: DailyRecord): number => d.count
export const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format
export const tooltip = (d: DataRecord): string =>
  `<b>M${d.magnitude} · ${d.place}</b><br/>${dayLabel(d.time)} UTC<br/>Depth: ${d.depth.toFixed(1)} km`
export const mapTooltipTriggers = { [TopoJSONMap.selectors.point]: (d: MapPoint): string => tooltip(d.properties) }
export const scatterTooltipTriggers = { [Scatter.selectors.point]: tooltip }
export function getView (
  state: ExampleState,
  update: UpdateState
): {
    data: DataRecord[];
    mapData: { points: DataRecord[] };
    daily: DailyRecord[];
    pointRadius: (d: DataRecord) => number;
    pointSize: (d: DataRecord) => number;
    pointColor: (d: DataRecord) => string;
    mapEvents: Record<string, Record<string, (d: MapPoint) => void>>;
    scatterEvents: Record<string, Record<string, (d: DataRecord) => void>>;
    summary: string;
  } {
  const selected = data.filter(
    d =>
      d.magnitude >= +state.minimum &&
      (state.half === 'all' || (state.half === 'first' ? new Date(d.time).getUTCDate() <= 15 : new Date(d.time).getUTCDate() > 15))
  )
  const chosen = selected.find(d => d.id === state.selected)
  const daily = Array.from({ length: 31 }, (_, i) => ({
    time: Date.UTC(2024, 0, i + 1),
    count: selected.filter(d => new Date(d.time).getUTCDate() === i + 1).length,
  }))
  return {
    data: selected,
    mapData: { points: selected },
    daily,
    pointRadius: (d): number => (d.id === state.selected ? 10 : 2 + (d.magnitude - 4) * 1.4),
    pointSize: (d): number => (d.id === state.selected ? 14 : 6),
    pointColor: (d): string => (d.id === state.selected ? 'var(--vis-color1)' : 'var(--vis-color0)'),
    mapEvents: { [TopoJSONMap.selectors.point]: { click: (d): void => update({ selected: d.properties.id }) } },
    scatterEvents: { [Scatter.selectors.point]: { click: (d): void => update({ selected: d.id }) } },
    summary: chosen
      ? `Selected: M${chosen.magnitude} · ${chosen.place} · ${chosen.depth.toFixed(1)} km deep`
      : `${selected.length} earthquakes shown · select an event to link the map and scatter plot`,
  }
}
