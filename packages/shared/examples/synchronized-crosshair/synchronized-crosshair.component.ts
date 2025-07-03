import { Component } from '@angular/core'
import { data1, data2, data3, DataRecord } from './data'

@Component({
  selector: 'synchronized-crosshair',
  templateUrl: './synchronized-crosshair.component.html',
})
export class SynchronizedCrosshairComponent {
  x = (d: DataRecord): number => d.x
  y = (d: DataRecord): number => d.y
  data1 = data1
  data2 = data2
  data3 = data3
  height = 200
  syncId = 'demo-sync'

  tooltipTemplate = (d: DataRecord): string => {
    return `<div><b>X: ${d.x}</b><br/>Y: ${d.y.toFixed(1)}<br/>Y1: ${d.y1.toFixed(1)}<br/>Y2: ${d.y2.toFixed(1)}</div>`
  }
}
