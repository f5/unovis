import { Component } from '@angular/core'
import { LabelOverflow } from '@unovis/ts'

import { data, thresholds, DataRecord } from './data'

@Component({
  selector: 'synced-auto-position',
  templateUrl: './synced-auto-position.component.html',
})
export class SyncedAutoPositionComponent {
  x = (d: DataRecord): number => d.x
  y = (d: DataRecord): number => d.y
  data = data
  thresholds = thresholds
  margin = { top: 10, right: 200, bottom: 30, left: 40 }
  yDomain: [number, number] = [5.0, 7.0]
  smart = LabelOverflow.Smart
}
