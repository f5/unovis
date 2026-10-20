import { Heatmap, HeatmapCellDatum } from '@unovis/ts'
import { data, DataRecord } from './data'

export const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
export const tooltipClassName = 'gallery-example-tooltip'


export type ExampleState = { rider: string }
export type UpdateState = (patch: Partial<ExampleState>) => void
export const initialState: ExampleState = { rider: 'all' }
export const riderOptions = [
  { value: 'all', label: 'All riders' },
  { value: 'member', label: 'Members' },
  { value: 'casual', label: 'Casual riders' },
]
export const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const colorRange = Array.from({ length: 7 }, (_, i) => `var(--bike-demand-color-${i + 1})`)
export const value = (d: DataRecord): number => d.count / d.days
export const weekdayLabel = (row: number): string => weekdays[row]
export const hourLabel = (column: number): string => (column % 3 === 0 ? `${String(column).padStart(2, '0')}:00` : '')
export const tooltipTriggers = {
  [Heatmap.selectors.cell]: (cell: HeatmapCellDatum<DataRecord>): string =>
    `<b>${weekdays[cell.datum.weekday]} · ${cell.datum.hour}:00</b><br/>${Math.round(value(cell.datum)).toLocaleString('en-US')} average starts<br/>${cell.datum.count.toLocaleString('en-US')} trips across ${cell.datum.days} matching days`,
}
export function getView (state: ExampleState): { data: DataRecord[]; colorDomain: [number, number]; maxLabel: string; summary: string } {
  const selected = data.filter(d => state.rider === 'all' || d.rider === state.rider)
  const cells = Array.from({ length: 24 }, (_, hour) =>
    Array.from({ length: 7 }, (_, weekday): DataRecord => {
      const records = selected.filter(d => d.hour === hour && d.weekday === weekday)
      return { rider: state.rider, weekday, hour, days: records[0]?.days ?? 1, count: records.reduce((sum, d) => sum + d.count, 0) }
    })
  ).flat()
  const peak = [...cells].sort((a, b) => value(b) - value(a))[0]
  const total = selected.reduce((sum, d) => sum + d.count, 0)
  return {
    data: cells,
    colorDomain: [0, Math.max(...cells.map(value))],
    maxLabel: `${Math.round(value(peak)).toLocaleString('en-US')} starts / hour`,
    summary: `${total.toLocaleString('en-US')} trip starts · busiest average hour: ${weekdays[peak.weekday]} ${peak.hour}:00 · cell color = average hourly starts`,
  }
}
