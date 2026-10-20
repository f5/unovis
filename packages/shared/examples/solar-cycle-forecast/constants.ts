import { data, DataRecord } from './data'
export { CurveType, PlotlineLabelPosition } from '@unovis/ts'

export const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
export const tooltipClassName = 'gallery-example-tooltip'


export type ExampleState = { domain: [number, number] }
export type UpdateState = (patch: Partial<ExampleState>) => void
export const initialState: ExampleState = { domain: [Date.UTC(2019, 0, 1), Date.UTC(2030, 11, 1)] }
export const forecastDash = [6, 4]
export const legend = [
  { name: 'Observed monthly mean', color: 'var(--vis-color0)' },
  { name: 'Forecast and 50% prediction range', color: 'var(--vis-color1)' },
]
export const time = (d: DataRecord): number => d.time
export const observed = (d: DataRecord): number | undefined => d.observed ?? undefined
export const predicted = (d: DataRecord): number | undefined => d.predicted ?? undefined
export const bandBaseline = (d: DataRecord): number => d.low ?? 0
export const bandHeight = (d: DataRecord): number => (d.high == null || d.low == null ? 0 : d.high - d.low)
export const yearLabel = (value: number | Date): string => String(new Date(+value).getUTCFullYear())
export const dateLabel = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format
export const crosshairTemplate = (d: DataRecord): string =>
  `<b>${dateLabel(d.time)}</b><br/>Observed: ${d.observed ?? 'unavailable'}<br/>Forecast: ${d.predicted ?? 'unavailable'}`
export function getView (
  state: ExampleState,
  update: UpdateState
): {
    data: DataRecord[];
    observed: DataRecord[];
    prediction: DataRecord[];
    forecastStart: number;
    onBrush: (selection: [number, number] | undefined, event: unknown, userDriven: boolean) => void;
    summary: string;
  } {
  const prediction = data.filter(d => d.predicted != null)
  return {
    data,
    observed: data.filter(d => d.observed != null),
    prediction,
    forecastStart: Date.UTC(2026, 9, 19),
    onBrush: (selection, _event, userDriven): void => {
      if (userDriven && selection && (selection[0] !== state.domain[0] || selection[1] !== state.domain[1])) update({ domain: selection })
    },
    summary: `${dateLabel(state.domain[0])} – ${dateLabel(state.domain[1])} · observations and predictions overlap where the source provides both`,
  }
}
