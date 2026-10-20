import { MapProjection, TopoJSONMap } from '@unovis/ts'
import { USATopoJSON } from '@unovis/ts/maps'
import { data, DataRecord } from './data'

export const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
export const tooltipClassName = 'gallery-example-tooltip'


export type ExampleState = { hub: string }
export type UpdateState = (patch: Partial<ExampleState>) => void
export type Airport = { id: string; latitude: number; longitude: number }
export const initialState: ExampleState = { hub: 'ATL' }
export const hubOptions = [
  { value: 'ATL', label: 'Atlanta · ATL' },
  { value: 'JFK', label: 'New York · JFK' },
  { value: 'LAX', label: 'Los Angeles · LAX' },
]
export const usa = USATopoJSON
export const rankTicks = Array.from({ length: 12 }, (_, i) => i)
const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
export const compact = (value: number | Date): string => compactFormatter.format(+value)
export const id = (d: Airport): string => d.id
export const latitude = (d: Airport): number => d.latitude
export const longitude = (d: Airport): number => d.longitude
export const pointLabel = (d: Airport): string => d.id
export const radius = 4
export const rank = (_d: DataRecord, i: number): number => i
export const passengers = (d: DataRecord): number => d.passengers
export const linkSource = (d: DataRecord): string => d.source
export const linkTarget = (d: DataRecord): string => d.target
export type MapRoute = { source: Airport; target: Airport }
export const routeData = (d: DataRecord | MapRoute): DataRecord | undefined =>
  'passengers' in d ? d : data.find(route => route.source === d.source.id && route.target === d.target.id)
export const linkWidth = (d: DataRecord | MapRoute): number => 0.5 + (routeData(d)?.passengers ?? 0) / 60000
export const sourceLatitude = (d: DataRecord): number => d.sourceLat
export const sourceLongitude = (d: DataRecord): number => d.sourceLon
export const targetLatitude = (d: DataRecord): number => d.targetLat
export const targetLongitude = (d: DataRecord): number => d.targetLon
export const tooltipTriggers = {
  [TopoJSONMap.selectors.link]: (d: MapRoute): string => {
    const route = routeData(d)
    return route ? `<b>${route.source} → ${route.target}</b><br/>${route.passengers.toLocaleString('en-US')} passengers` : ''
  },
  [TopoJSONMap.selectors.point]: (d: { properties: Airport }): string => `<b>${d.properties.id}</b>`,
}
export function getView (state: ExampleState): {
  data: DataRecord[];
  mapData: { points: Airport[]; links: DataRecord[] };
  projection: ReturnType<typeof MapProjection.AlbersUsa>;
  density: (d: DataRecord) => number;
  destinationLabel: (value: number | Date) => string;
  summary: string;
} {
  const selected = data.filter(d => d.source === state.hub).sort((a, b) => b.passengers - a.passengers)
  const origin: Airport = { id: state.hub, latitude: selected[0].sourceLat, longitude: selected[0].sourceLon }
  const points = [origin, ...selected.map(d => ({ id: d.target, latitude: d.targetLat, longitude: d.targetLon }))]
  const maximum = Math.max(...selected.map(d => d.passengers))
  return {
    data: selected,
    mapData: { points, links: selected.map(d => ({ ...d })) },
    projection: MapProjection.AlbersUsa(),
    density: (d): number => 0.1 + (0.7 * d.passengers) / maximum,
    destinationLabel: (value): string => selected[+value]?.target ?? '',
    summary: `${selected.reduce((sum, d) => sum + d.passengers, 0).toLocaleString('en-US')} passengers on the 12 displayed routes from ${state.hub} · ribbon width and particles encode passenger volume`,
  }
}
