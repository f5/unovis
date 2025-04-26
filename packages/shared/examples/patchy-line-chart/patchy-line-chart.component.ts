import { Component, OnInit } from '@angular/core'
import { CurveType } from '@unovis/ts'
import { data, countries, Country, DataRecord } from './data'

@Component({
  selector: 'patchy-line-chart',
  templateUrl: './patchy-line-chart.component.html',
  styleUrls: ['./styles.css'],
})
export class PatchyLineChartComponent implements OnInit {
  // Data
  data = data
  countries = countries

  // Options
  fallbacks = [null, undefined, 0, 2000]
  fallbackValue: any = this.fallbacks[0]
  interpolation = true
  showScatter = true

  // Chart configuration
  xDomain = [1989, 2024]
  curveType = CurveType.Linear
  yTickValues = [100, 1000, 2000, 3000, 4000]

  // Callbacks
  xCallback = (d: DataRecord): number => d.year
  countriesYCallbacks: ((d: DataRecord) => number)[] = []

  ngOnInit (): void {
    this.countriesYCallbacks = this.countries.map(c => this.getY(c))
  }

  getY (c: Country): (d: DataRecord) => number {
    return (d: DataRecord) => d[c.id]
  }

  setFallbackValue (index: number): void {
    this.fallbackValue = this.fallbacks[index]
  }

  toggleInterpolation (): void {
    this.interpolation = !this.interpolation
  }

  toggleShowScatter (): void {
    this.showScatter = !this.showScatter
  }

  tooltipTemplate (d: DataRecord): string {
    return `Year: ${d.year} <br/> India: ${d.in ? `${Math.round(d.in || 0)}kWh` : 'NA'}<br/> Brazil: ${d.br ? `${Math.round(d.br || 0)}kWh` : 'NA'}`
  }

  yAxisTickFormat (d: number): string {
    return `${d}${d ? 'kWh' : ''}`
  }
}
