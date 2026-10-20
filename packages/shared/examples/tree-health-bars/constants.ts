import { StackedBar } from '@unovis/ts'
import { data, DataRecord } from './data'

export const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
export const tooltipClassName = 'gallery-example-tooltip'


export type ExampleState = { sort: string }
export type UpdateState = (patch: Partial<ExampleState>) => void
export const initialState: ExampleState = { sort: 'good' }
export const sortOptions = [
  { value: 'good', label: 'Good-health share' },
  { value: 'poor', label: 'Poor-health share' },
  { value: 'total', label: 'Number of living trees' },
]
export const healthKeys = ['good', 'fair', 'poor', 'unknown'] as const
export const healthNames = ['Good', 'Fair', 'Poor', 'Unknown']
export const healthColors = ['#4ca88d', '#e1b759', '#d48086', '#9aa6b8']
export const legend = healthNames.map((name, i) => ({ name, color: healthColors[i] }))
export const rankTicks = [0, 1, 2, 3, 4]
export const percentTicks = [0, 25, 50, 75, 100]
export const percentDomain: [number, number] = [0, 100]
export const accessors = healthKeys.map(
  key =>
    (d: DataRecord): number =>
      (100 * d[key]) / d.total
)
export const rank = (_d: DataRecord, i: number): number => i
export const tooltipTriggers = {
  [StackedBar.selectors.bar]: (bar: { datum: DataRecord }): string => {
    const d = bar.datum
    return `<b>${d.borough}</b><br/>${healthKeys.map((key, i) => `${healthNames[i]}: ${d[key].toLocaleString('en-US')} (${((100 * d[key]) / d.total).toFixed(1)}%)`).join('<br/>')}<br/>Total: ${d.total.toLocaleString('en-US')} living trees`
  },
}
export function getView (state: ExampleState): { data: DataRecord[]; boroughLabel: (value: number | Date) => string; summary: string } {
  const selected = [...data].sort((a, b) =>
    state.sort === 'total'
      ? b.total - a.total
      : state.sort === 'poor'
        ? b.poor / b.total - a.poor / a.total
        : b.good / b.total - a.good / a.total
  )
  return {
    data: selected,
    boroughLabel: (value): string => selected[+value]?.borough ?? '',
    summary: `${data.reduce((sum, d) => sum + d.total, 0).toLocaleString('en-US')} living street trees across five boroughs · every bar has its own borough’s living-tree total as denominator`,
  }
}
