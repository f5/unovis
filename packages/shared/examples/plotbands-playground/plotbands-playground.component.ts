import { Component } from '@angular/core'
import { data, DataRecord } from './data'

@Component({
  selector: 'plotbands-playground',
  templateUrl: './plotbands-playground.component.html',
})
export class PlotbandsPlaygroundComponent {
  x = (d: DataRecord): number => d.x
  y = (d: DataRecord): number => d.y
  data = data
}
