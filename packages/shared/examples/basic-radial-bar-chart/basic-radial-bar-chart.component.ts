import { Component } from '@angular/core'
import { RadialBar, RadialBarArcDatum } from '@unovis/ts'
import { data, DataRecord, maxValue, completion } from './data'

@Component({
  selector: 'basic-radial-bar-chart',
  templateUrl: './basic-radial-bar-chart.component.html',
})

export class BasicRadialBarChartComponent {
  value = (d: DataRecord): number => d.value
  data = data
  maxValue = maxValue
  centralLabel = `${completion}%`
  legendItems = data.map(d => ({ name: d.key }))
  triggers = {
    [RadialBar.selectors.bar]: (d: RadialBarArcDatum<DataRecord>): string => {
      const max = maxValue[d.index] ?? '—'
      return `<strong>${d.data.key}</strong><br/>${d.value} / ${max} ${d.data.unit}`
    },
  }
}
