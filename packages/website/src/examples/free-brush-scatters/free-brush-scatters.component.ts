import { Component } from '@angular/core'
import { FreeBrushMode, Scale } from '@volterra/vis'
import { data, palette, DataRecord } from './data'

const categories = [...new Set(data.map((d: DataRecord) => d.category))].sort()
const colorScale = Scale.scaleOrdinal(palette).domain(categories)
@Component({
  selector: 'free-brush-scatters',
  templateUrl: './free-brush-scatters.component.html',
  styleUrls: ['./styles.css'],
})
export class FreeBrushScattersComponent {
  brushMode = FreeBrushMode.XY
  data = data
  formatNumber = Intl.NumberFormat('en', { notation: 'compact' }).format
  legendItems = categories.map(v => ({ name: v, color: colorScale(v) }))
  focusedData = []

  x = (d: DataRecord) => d.medianSalary
  y = (d: DataRecord) => d.employmentRate
  color = (d: DataRecord) => colorScale(d.category)
  size = (d: DataRecord) => d.total
  label = (d: DataRecord) => d.major

  setSelection (s: [[number, number], [number, number]] | null = null) {
    const inRange = (s: [number, number], n: number) => s[0] <= n && n <= s[1]
    this.focusedData= s ?
      data.filter(d =>  inRange(s[0], this.x(d)) && inRange(s[1], this.y(d)))
      : []
  }
}
