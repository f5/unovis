import { Component } from '@angular/core'
import { CircularBar, CircularBarArcDatum } from '@unovis/ts'
import { data, DataRecord, maxValue } from './data'

@Component({
  selector: 'basic-circular-bar-chart',
  standalone: false,
  templateUrl: './basic-circular-bar-chart.component.html',
  styleUrls: ['./styles.css'],
})

export class BasicCircularBarChartComponent {
  value = (d: DataRecord): number => d.value
  color = (d: DataRecord): string => d.color
  icon = (d: DataRecord): string => d.icon
  data = data
  maxValue = maxValue
  legendItems = data.map(d => ({ name: d.key, color: d.color }))
  triggers = {
    [CircularBar.selectors.bar]: (d: CircularBarArcDatum<DataRecord>): string => {
      const max = maxValue[d.index] ?? '—'
      return `<strong>${d.data.key}</strong><br/>${d.value} / ${max} ${d.data.unit}`
    },
  }
}
