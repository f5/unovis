import { Component } from '@angular/core'
import { CurveType } from '@unovis/ts'
import { data, categories, Category, DataRecord } from './data'

@Component({
  selector: 'baseline-area-chart',
  templateUrl: './baseline-area-chart.component.html',
})
export class BaselineAreaChartComponent {
  data = data
  legendItems = categories
  sums = data.map(d => d.art.reduce((t, i) => t + i, 0))
  max: number = Math.max(...this.sums)

  // Area
  x = (d: DataRecord): number => d.year
  y = categories.map((c: Category) => (d: DataRecord) => d.art[c.id])
  color = categories.map((c: Category): string => Array.isArray(c.color) ? c.color[0] : (c.color as string))
  baseline = (_: DataRecord, i: number): number => (this.max - this.sums[i]) / 2
  curveType = CurveType.Basis

  // Y Axis
  tickValues = Array<number>(Math.round(this.max / 1000)).fill(0).map((_, i) => {
    const dir = i % 2 === 1 ? -(i - 1) : i
    return this.max / 2 + dir * 1000
  })

  tickFormat = (i: number): string => `${Math.abs(i - this.max / 2)}`
}
