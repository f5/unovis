import { Component } from '@angular/core'
import { FreeBrushMode, Scale } from '@unovis/ts'
import { data, palette, DataRecord } from './data'

@Component({
  selector: 'free-brush-scatters',
  templateUrl: './free-brush-scatters.component.html',
  styleUrls: ['./styles.css'],
  standalone: false,
})
export class FreeBrushScattersComponent {
  brushMode = FreeBrushMode.XY
  data = data
  categories = [...new Set(this.data.map((d: DataRecord) => d.category))].sort()
  colorScale = Scale.scaleOrdinal(palette).domain(this.categories)
  formatNumber = Intl.NumberFormat('en').format
  legendItems = this.categories.map(v => ({ name: v, color: this.colorScale(v) }))

  id = (d: DataRecord): string => d.major
  x = (d: DataRecord): number => d.medianSalary
  y = (d: DataRecord): number => d.employmentRate
  color = (d: DataRecord): string => this.colorScale(d.category)
  size = (d: DataRecord): number => d.total
  label = (d: DataRecord): string => d.major

  xDomain: undefined | [number, number]
  yDomain: undefined | [number, number]

  setSelection = (s: [[number, number], [number, number]] | null = null): void => {
    this.xDomain = s?.[0]
    this.yDomain = s?.[1]
  }
}
