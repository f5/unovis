import { Component } from '@angular/core'
import { NestedDonutDirection, NestedDonutSegment } from '@unovis/ts'
import { colors, data, Datum } from './data'

@Component({
  selector: 'sunburst-nested-donut',
  templateUrl: './sunburst-nested-donut.component.html',
  styleUrls: ['./styles.css'],
  standalone: false,
})
export class SunburstChartComponent {
  data = data
  direction = NestedDonutDirection.Outwards
  layers = [
    (d: Datum): string => d.type,
    (d: Datum): string => d.group,
    (d: Datum): string => d.subgroup,
    (d: Datum): string => d.description,
    (d: Datum): string => d.item,
  ]

  layerSettings = { width: '6vmin' }

  segmentColor = (d: NestedDonutSegment<Datum>): string => colors.get(d.data.key)
}
