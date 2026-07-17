import { Component } from '@angular/core'
import { Sizing } from '@unovis/ts'
import { data, DataRecord, numRows, offset, columnLabel, rowLabel } from './data'

@Component({
  selector: 'github-style-heatmap',
  templateUrl: './github-style-heatmap.component.html',
})
export class GitHubStyleHeatmapComponent {
  value = (d: DataRecord): number | undefined => d.count || undefined
  data = data
  numRows = numRows
  offset = offset
  columnLabel = columnLabel
  rowLabel = rowLabel
  sizing = Sizing.Extend
}
