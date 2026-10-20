import { StackedBar, Scatter } from '@unovis/ts'
import { data, DataRecord } from './data'

export const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
export const tooltipClassName = 'gallery-example-tooltip'


export type ExampleState = { sort: string }
export type UpdateState = (patch: Partial<ExampleState>) => void
export const initialState: ExampleState = { sort: 'gains' }
export const sortOptions = [
  { value: 'gains', label: 'Largest net gains' },
  { value: 'losses', label: 'Largest net losses' },
  { value: 'volume', label: 'Most interstate moves' },
]
export const rankTicks = Array.from({ length: 10 }, (_, i) => i)
export const balanceColors = ['var(--vis-color0)', 'var(--vis-color1)']
export const legend = [
  { name: 'Arrivals', color: balanceColors[0] },
  { name: 'Departures (plotted negative)', color: balanceColors[1] },
  { name: 'Net change', color: 'var(--vis-color2)' },
]
const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
export const compact = (value: number | Date): string => compactFormatter.format(+value)
export const rank = (_d: DataRecord, i: number): number => i
export const arrivals = (d: DataRecord): number => d.arrivals
export const departures = (d: DataRecord): number => -d.departures
export const net = (d: DataRecord): number => d.net
export const accessors = [arrivals, departures]
export const tooltip = (d: DataRecord): string =>
  `<b>${d.state}</b><br/>Arrivals: ${d.arrivals.toLocaleString('en-US')}<br/>Departures: ${d.departures.toLocaleString('en-US')}<br/>Net change: ${d.net > 0 ? '+' : ''}${d.net.toLocaleString('en-US')}`
export const tooltipTriggers = {
  [StackedBar.selectors.bar]: (bar: { datum: DataRecord }): string => tooltip(bar.datum),
  [Scatter.selectors.point]: tooltip,
}
export function getView (state: ExampleState): { data: DataRecord[]; stateLabel: (value: number | Date) => string; summary: string } {
  const selected = [...data]
    .sort((a, b) =>
      state.sort === 'gains'
        ? b.net - a.net
        : state.sort === 'losses'
          ? a.net - b.net
          : b.arrivals + b.departures - a.arrivals - a.departures
    )
    .slice(0, 10)
  return {
    data: selected,
    stateLabel: (value): string => selected[+value]?.state ?? '',
    summary: `10 states shown · ${data.reduce((sum, d) => sum + d.arrivals, 0).toLocaleString('en-US')} estimated interstate moves nationally · national arrivals and departures balance exactly`,
  }
}
