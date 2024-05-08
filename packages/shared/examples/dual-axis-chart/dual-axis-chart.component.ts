import { Component } from '@angular/core'
import { XYDataRecord, generateXYDataRecords } from './data'

@Component({
  selector: 'dual-axis-chart',
  templateUrl: './dual-axis-chart.component.html',
})
export class DualAxisChartComponent {
  data = generateXYDataRecords(150)

  margin = { left: 100, right: 100, top: 40, bottom: 60 }
  style = { position: 'absolute', top: 0, left: 0, width: '100%', height: '40vh' }

  chartX = (d: XYDataRecord): number => d.x
  chartAY = (d: XYDataRecord, i: number): number => i * (d.y || 0)
  chartBY = (d: XYDataRecord): number => 20 + 10 * (d.y2 || 0)
  xTicks = (x: number): string => `${x}ms`
  chartAYTicks = (y: number): string => `${y}bps`
  chartBYTicks = (y: number): string => `${y}db`
}
