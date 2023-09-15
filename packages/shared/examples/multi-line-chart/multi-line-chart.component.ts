import { Component } from '@angular/core'
import { Scale, BulletLegendItemInterface } from '@unovis/ts'
import { data, labels, CityTemps } from './data'

@Component({
  selector: 'multi-line-chart',
  templateUrl: './multi-line-chart.component.html',
})
export class MultiLineChartComponent {
  data = data
  x = (d: CityTemps): number => Number(new Date(d.date))
  y = [
    (d: CityTemps): number => d.austin,
    (d: CityTemps): number => d.ny,
    (d: CityTemps): number => d.sf,
  ]

  legendItems: BulletLegendItemInterface[] = ['austin', 'ny', 'sf'].map(
    city => ({
      name: labels[city],
    })
  )

  formatTick = (d: Date): string => Intl.DateTimeFormat().format(new Date(d))
  xScale = Scale.scaleTime()
}
