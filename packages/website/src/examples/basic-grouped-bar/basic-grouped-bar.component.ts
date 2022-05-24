import { Component } from '@angular/core'
import { data, colors, ElectionDatum } from './data'

@Component({
  selector: 'basic-grouped-bar',
  templateUrl: './basic-grouped-bar.component.html',
})
export class BasicGroupedBarComponent {
  x = (d: ElectionDatum): number => d.year
  y = [
    (d: ElectionDatum) => d.republican,
    (d: ElectionDatum) => d.democrat,
    (d: ElectionDatum) => d.other,
    (d: ElectionDatum) => d.libertarian
  ]
  data = data

  legendItems = Object.entries(colors).map(([n, c]) => ({
    name: n.toUpperCase(),
    color: c,
  }))

  color = (d : ElectionDatum, i: number) => this.legendItems[i].color

}
