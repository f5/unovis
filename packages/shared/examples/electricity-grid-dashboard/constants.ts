import { colors, getLighterColor } from '@unovis/ts'
import { data, DataRecord } from './data'
export { CurveType } from '@unovis/ts'


export type ExampleState = { authority: string; domain: [number, number]; cursor: number | undefined }
export type UpdateState = (patch: Partial<ExampleState>) => void
export const initialState: ExampleState = { authority: 'CISO', domain: [Date.UTC(2024, 5, 18), Date.UTC(2024, 5, 22)], cursor: undefined }
export const authorityOptions = [
  { value: 'CISO', label: 'California ISO' },
  { value: 'ERCO', label: 'ERCOT (Texas)' },
  { value: 'NYIS', label: 'New York ISO' },
]
export const fuelKeys: (keyof DataRecord)[] = ['gas', 'nuclear', 'coal', 'hydro', 'solar', 'wind', 'petroleum', 'other', 'unknown']
export const fuelNames = ['Natural gas', 'Nuclear', 'Coal', 'Hydro / pumping', 'Solar', 'Wind', 'Petroleum', 'Other', 'Unknown']
export const fuelColors = [...colors, ...colors.map(color => getLighterColor(color, 0.25))].slice(0, fuelKeys.length)
export const fuelAccessors = fuelKeys.map(
  key =>
    (d: DataRecord): number | undefined =>
      d[key] == null ? undefined : +d[key]
)
export const legend = fuelNames.map((name, i) => ({ name, color: fuelColors[i] }))
export const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
export const chartMargin = { left: 60, right: 16, top: 8, bottom: 48 }
export const byAuthority = Object.fromEntries(
  authorityOptions.map(option => [option.value, data.filter(d => d.authority === option.value)])
)
export const time = (d: DataRecord): number => d.time
export const demand = (d: DataRecord): number | undefined => d.demand ?? undefined
export const forecast = (d: DataRecord): number | undefined => d.forecast ?? undefined
export const demandAccessors = [demand, forecast]
export const demandColors = ['var(--vis-color0)', 'var(--vis-color1)']
export const dayLabel = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  hour12: false,
  timeZone: 'UTC',
}).format
export const hourLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', timeZone: 'UTC' }).format
export const generationTooltip = (d: DataRecord): string =>
  `<div class="electricity-grid-tooltip"><b>${hourLabel(d.time)} UTC</b>${fuelKeys.map((key, i) => `<div>${fuelNames[i]}: ${d[key] ?? 'unavailable'} GW</div>`).join('')}</div>`
export const demandTooltip = (d: DataRecord): string =>
  `<div class="electricity-grid-tooltip"><b>${hourLabel(d.time)} UTC</b><div>Actual: ${d.demand ?? 'unavailable'} GW</div><div>Forecast: ${d.forecast ?? 'unavailable'} GW</div></div>`
export function getView (
  state: ExampleState,
  update: UpdateState
): {
    data: DataRecord[];
    summary: string;
    onMove: (value: number | Date | undefined) => void;
    onBrush: (selection: [number, number] | undefined, event: unknown, userDriven: boolean) => void;
  } {
  return {
    data: byAuthority[state.authority],
    summary: `${authorityOptions.find(d => d.value === state.authority)?.label} · ${dayLabel(state.domain[0])} – ${dayLabel(state.domain[1])} · blue demand line = actual; coral demand line = day-ahead forecast`,
    onMove: (value): void => {
      const cursor = value == null ? undefined : +value
      if (cursor !== state.cursor) update({ cursor })
    },
    onBrush: (selection, _event, userDriven): void => {
      if (userDriven && selection && (selection[0] !== state.domain[0] || selection[1] !== state.domain[1])) update({ domain: selection })
    },
  }
}
