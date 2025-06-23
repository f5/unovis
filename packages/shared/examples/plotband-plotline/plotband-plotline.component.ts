import { Component } from '@angular/core'
import { data, DataRecord } from './data'

@Component({
  selector: 'plotband-plotline',
  templateUrl: './plotband-plotline.component.html',
})
export class PlotbandPlotlineComponent {
  x = (d: DataRecord): number => d.x
  y = (d: DataRecord): number => d.y
  data = data
}
