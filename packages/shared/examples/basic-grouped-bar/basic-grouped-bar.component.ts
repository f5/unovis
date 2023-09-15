import { Component } from '@angular/core'
import { data, colors, ElectionDatum } from './data'

@Component({
  selector: 'basic-grouped-bar',
  templateUrl: './basic-grouped-bar.component.html',
})
export class BasicGroupedBarComponent {
  x = (d: ElectionDatum): number => d.year
  y = [
    (d: ElectionDatum): number => d.republican,
    (d: ElectionDatum): number => d.democrat,
    (d: ElectionDatum): number => d.other,
    (d: ElectionDatum): number => d.libertarian,
  ]

  data = data

  legendItems = Object.entries(colors).map(([n, c]) => ({
    name: n.toUpperCase(),
    color: c,
  }))

  color = (d: ElectionDatum, i: number): string => this.legendItems[i].color
  tickFormat = (value: number): string => (value / 10 ** 6).toFixed(1)
}
