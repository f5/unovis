import { Component } from '@angular/core'
import { data, formats, DataRecord, getLabels, gradients, legendItems, svgDefs, tooltipTemplate } from './data'

@Component({
  selector: 'stacked-area-chart',
  templateUrl: './stacked-area-chart.component.html',
  standalone: false,
})
export class StackedAreaComponent {
  data = data
  legendItems = legendItems
  svgDefs = svgDefs
  x = (d: DataRecord): number => d.year
  y = formats.map(f => (d: DataRecord) => d[f])
  color = (_: DataRecord[], i: number): string => gradients[i]
  tooltipTemplate = tooltipTemplate

  labelItems = getLabels(this.data)
  labelY = (d: DataRecord): number => this.labelItems[d.year]?.value ?? 0
  labelText = (d: DataRecord): string => this.labelItems[d.year]?.label ?? ''
  labelColor = (d: DataRecord): string => this.labelItems[d.year]?.color ?? 'none'
  noLabel = (): string => ''
}
