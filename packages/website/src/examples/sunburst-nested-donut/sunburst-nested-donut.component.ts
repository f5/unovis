import { Component } from '@angular/core'
import { NestedDonutDirection, NestedDonutSegment } from '@unovis/ts'
import { colors, data, Datum } from './data'

@Component({
  selector: 'sunburst-nested-donut',
  templateUrl: './sunburst-nested-donut.component.html',
})
export class SunburstChartComponent {
  data = data
  direction = NestedDonutDirection.Outwards
  layers = [
    (d: Datum) => d.type,
    (d: Datum) => d.group,
    (d: Datum) => d.subgroup,
    (d: Datum) => d.description,
    (d: Datum) => d.item,
  ]

  layerSettings = {
    width: 100,
    rotateLabels: true,
  }

  segmentColor = (d: NestedDonutSegment<Datum>): string => colors.get(d.data.key)
}
