import { Component } from '@angular/core'
import { BulletLegendItemInterface } from '@volterra/vis'
import { data, labels, CityTemps } from './data'

@Component({
  selector: 'multi-line-chart',
  templateUrl: './multi-line-chart.component.html',
})
export class MultiLineChartComponent {
  data = data
  x = (d: CityTemps) => Number(new Date(d.date))
  y = [
    (d: CityTemps) => d.austin,
    (d: CityTemps) => d.ny,
    (d: CityTemps) => d.sf,
  ]

  legendItems: BulletLegendItemInterface[] = ['austin', 'ny', 'sf'].map(
    city => ({
      name: labels[city]
    })
  )

  formatTick = (d: Date) => Intl.DateTimeFormat().format(new Date(d))
}
