import { Component } from '@angular/core'
import type { BulletLegendItemInterface, NumericAccessor, StringAccessor } from '@unovis/ts'
import { data, DataRecord } from './data'

@Component({
  selector: 'basic-scatter-plot',
  templateUrl: './basic-scatter-plot.component.html',
})
export class BasicScatterPlotComponent {
  data = data

  legendItems: BulletLegendItemInterface[] = [
    { name: 'Male', color: '#1fc3aa' },
    { name: 'Female', color: '#8624F5' },
    { name: 'No Data', color: '#aaa' },
  ]

  x: NumericAccessor<DataRecord> = d => d.beakLength
  y: NumericAccessor<DataRecord> = d => d.flipperLength
  color: StringAccessor<DataRecord> = d => this.legendItems.find(i => i.name === (d.sex ?? 'No Data'))?.color
}
