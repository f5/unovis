import { Component } from '@angular/core'
import { data, DataRecord } from './data'

@Component({
  selector: 'plotlines-playground',
  templateUrl: './plotlines-playground.component.html',
})
export class PlotlinesPlaygroundComponent {
  x = (d: DataRecord): number => d.x
  y = (d: DataRecord): number => d.y
  data = data
}
