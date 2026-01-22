import { Component } from '@angular/core'
import { data, DataRecord } from './data'

@Component({
  selector: 'basic-line-chart',
  templateUrl: './basic-line-chart.component.html',
  standalone: false,
})
export class BasicLineChartComponent {
  x = (d: DataRecord): number => d.x
  y = (d: DataRecord): number => d.y
  data = data
}
