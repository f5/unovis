import { Component } from '@angular/core'
import { FreeBrushMode, Scale } from '@volterra/vis'
import { data, palette, DataRecord } from './data'

@Component({
  selector: 'free-brush-scatters',
  templateUrl: './free-brush-scatters.component.html',
  styleUrls: ['./styles.css'],
})
export class FreeBrushScattersComponent {
  brushMode = FreeBrushMode.XY
  data = data
  categories = [...new Set(this.data.map((d: DataRecord) => d.category))].sort()
  colorScale = Scale.scaleOrdinal(palette).domain(this.categories)
  formatNumber = Intl.NumberFormat('en', { notation: 'compact' }).format
  legendItems = this.categories.map(v => ({ name: v, color: this.colorScale(v) }))

  id = (d: DataRecord) => d.major
  x = (d: DataRecord) => d.medianSalary
  y = (d: DataRecord) => d.employmentRate
  color = (d: DataRecord) => this.colorScale(d.category)
  size = (d: DataRecord) => d.total
  label = (d: DataRecord) => d.major

  xDomain: undefined | [number, number]
  yDomain: undefined | [number, number]

  setSelection = (s: [[number, number], [number, number]] | null = null) => {
    this.xDomain = s?.[0]
    this.yDomain = s?.[1]
  }
}
