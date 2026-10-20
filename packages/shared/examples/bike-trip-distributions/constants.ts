import { GroupedBar } from '@unovis/ts'
import { data } from './data'
export { CurveType, PlotlineLabelPosition } from '@unovis/ts'

export const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
export const tooltipClassName = 'gallery-example-tooltip'


export type ExampleState = { rider: string; limit: string }
export type UpdateState = (patch: Partial<ExampleState>) => void
export type HistogramRecord = { minute: number; count: number; share: number }
export type CumulativeRecord = { edge: number; cumulative: number }
export const initialState: ExampleState = { rider: 'all', limit: '60' }
export const riderOptions = [
  { value: 'all', label: 'All riders' },
  { value: 'member', label: 'Members' },
  { value: 'casual', label: 'Casual riders' },
]
export const limitOptions = [
  { value: '30', label: 'First 30 minutes' },
  { value: '60', label: 'First 60 minutes' },
  { value: '120', label: 'First 120 minutes' },
]
export const cumulativeDomain: [number, number] = [0, 1]
export const minute = (d: HistogramRecord): number => d.minute + 0.5
export const share = (d: HistogramRecord): number => d.share
export const edge = (d: CumulativeRecord): number => d.edge
export const cumulative = (d: CumulativeRecord): number => d.cumulative
export const percent = (value: number | Date): string => `${Math.round(+value * 100)}%`
export const histogramTooltipTriggers = {
  [GroupedBar.selectors.bar]: (d: HistogramRecord): string =>
    `<b>${d.minute}–${d.minute + 1} minutes</b><br/>${d.count.toLocaleString('en-US')} rides · ${(100 * d.share).toFixed(2)}%`,
}
export const cumulativeTooltip = (d: CumulativeRecord): string =>
  `<b>Under ${d.edge} minutes</b><br/>${(100 * d.cumulative).toFixed(1)}% of all positive-duration rides`
export function getView (state: ExampleState): {
  histogram: HistogramRecord[];
  cumulative: CumulativeRecord[];
  domain: [number, number];
  summary: string;
} {
  const selected = data.filter(d => state.rider === 'all' || d.rider === state.rider)
  const total = selected.reduce((sum, d) => sum + d.count, 0)
  const bins = Array.from({ length: 121 }, (_, minute) => ({
    minute,
    count: selected.filter(d => d.minute === minute).reduce((sum, d) => sum + d.count, 0),
  }))
  let running = 0
  const cumulative = [
    { edge: 0, cumulative: 0 },
    ...bins
      .filter(d => d.minute < 120)
      .map(d => {
        running += d.count
        return { edge: d.minute + 1, cumulative: running / total }
      }),
  ]
  const visible = bins.filter(d => d.minute < +state.limit)
  const outside = bins.filter(d => d.minute >= +state.limit).reduce((sum, d) => sum + d.count, 0)
  return {
    histogram: visible.map(d => ({ ...d, share: d.count / total })),
    cumulative,
    domain: [0, +state.limit],
    summary: `${total.toLocaleString('en-US')} positive-duration rides · ${outside.toLocaleString('en-US')} rides (${((100 * outside) / total).toFixed(1)}%) extend beyond the visible duration range`,
  }
}
