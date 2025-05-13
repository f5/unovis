import { Component } from '@angular/core'
import { data, DataRecord } from './data'

@Component({
  selector: 'basic-plotline',
  templateUrl: './basic-plotline.component.html',
})
export class BasicPlotbandComponent {
  x = (d: DataRecord): number => d.x
  y = (d: DataRecord): number => d.y
  data = data
}
