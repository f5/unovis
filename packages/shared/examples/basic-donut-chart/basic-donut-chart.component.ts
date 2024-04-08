import { Component } from '@angular/core'
import { data, DataRecord } from './data'

@Component({
  selector: 'basic-donut-chart-component',
  templateUrl: './basic-donut-chart.component.html',
})

export class BasicDonutChartComponent {
  value = (d: DataRecord): number => d.value
  data = data
  legendItems = Object.entries(data).map(([_, data]) => ({
    name: data.key.charAt(0).toUpperCase() + data.key.slice(1),
  }))
}

