import { Heatmap, SingleContainer, Sizing } from '@unovis/ts'
import { data, DataRecord, numRows, offset, columnLabel, rowLabel } from './data'

const container = document.getElementById('vis-container') as HTMLElement

const heatmap = new Heatmap<DataRecord>({
  value: (d: DataRecord) => d.count || undefined,
  numRows,
  offset,
  cellSize: 14,
  cellPadding: 3,
  cellCornerRadius: 3,
  columnLabel,
  rowLabel,
})

const chart = new SingleContainer(container, {
  component: heatmap,
  sizing: Sizing.Extend,
}, data)
