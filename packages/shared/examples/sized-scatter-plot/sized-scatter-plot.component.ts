import { Component } from '@angular/core'
import { Scale, Scatter, StringAccessor } from '@unovis/ts'
import { data, DataRecord, palette } from './data'

const categories = [...new Set(data.map((d: DataRecord) => d.category))].sort()
const colorScale = Scale.scaleOrdinal(palette).domain(categories)
const formatNumber = Intl.NumberFormat('en').format

@Component({
  selector: 'sized-scatter-plot',
  templateUrl: './sized-scatter-plot.component.html',
})
export class SizedScatterPlotComponent {
  data = data

  getX = (d: DataRecord): number => d.medianSalary
  getY = (d: DataRecord): number => d.employmentRate
  getColor = (d: DataRecord): string => colorScale(d.category)
  getSize = (d: DataRecord): number => d.total
  getLabel = (d: DataRecord): string => formatNumber(d.total)

  legendItems = categories.map(v => ({ name: v, color: colorScale(v) }))
  tooltipTriggers = {
    [Scatter.selectors.point]: (d: DataRecord): string => `
      ${d.major}<br/>Number of graduates: ${d.total.toLocaleString()}
    `,
  }

  xTicks: StringAccessor<number> = formatNumber
}
