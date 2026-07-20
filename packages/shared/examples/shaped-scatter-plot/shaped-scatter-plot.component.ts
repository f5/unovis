import { Component } from '@angular/core'
import { Scale, Scatter, colors } from '@unovis/ts'
import { data, DataRecord, shapes, categories, sumCategories } from './data'

const shapeScale = Scale.scaleOrdinal(shapes).domain(categories)
const colorScale = Scale.scaleOrdinal(colors).domain(categories)

@Component({
  selector: 'shaped-scatter-plot',
  templateUrl: './shaped-scatter-plot.component.html',
  standalone: false,
})
export class ShapedScatterPlotComponent {
  data = data

  getX = (d: DataRecord): number => +(new Date(`01-${d.date}`))
  getY = (d: DataRecord): number => d.trainedParam
  getColor = (d: DataRecord): string => colorScale(sumCategories(d.owner))
  getShape = (d: DataRecord): string => shapeScale(sumCategories(d.owner))
  getLabel = (d: DataRecord): string => d.name

  legendItems = categories.map(v => ({ name: v, color: colorScale(v) }))
  tooltipTriggers = {
    [Scatter.selectors.point]: (d: DataRecord): string => `
      <strong>name</strong>: ${d.name} <br>
      <strong>owner</strong>: ${d.owner} <br>
      <strong>bn parameters</strong>: ${d.trainedParam}`,
  }

  xTicks = Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format
}
