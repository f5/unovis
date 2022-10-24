import { Component } from '@angular/core'
import { BulletLegendItemInterface } from '@unovis/ts'
import { data, countries, legendItems, Country, DataRecord } from './data'

@Component({
  selector: 'data-gap-line-chart',
  templateUrl: './data-gap-line-chart.component.html',
  styleUrls: ['./styles.css'],
})
export class DataGapLineChartComponent {
  // shared y accessor
  yAccessor (c: Country): (d: DataRecord) => number {
    return (d: DataRecord) => d[c.id]
  }

  // index for current fallback value
  private _curr = 0

  // line config
  data = data
  x = (d: DataRecord): number => d.year
  y: ((d: DataRecord) => number)[] = countries.map(this.yAccessor)
  get fallbackValue (): undefined | null | number {
    return legendItems[this._curr].value
  }

  // label config
  labels = ({
    data: countries,
    y: (c: Country) => this.yAccessor(c)(data[data.length - 1]),
    label: (c: Country) => c.label,
  })

  tickFormat = (d: number) => `${d}${d ? 'M' : ''}`

  // legend config
  legendItemClick = (_, i: number): void => { this._curr = i }
  get legendItems (): BulletLegendItemInterface[] {
    return legendItems.map((o, i) => ({
      name: o.name,
      inactive: this._curr !== i,
      color: countries[0].color,
    }))
  }
}
