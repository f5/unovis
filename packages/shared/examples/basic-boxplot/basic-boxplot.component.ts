import { Component } from '@angular/core'
import { data, DataRecord } from './data'

@Component({
  selector: 'basic-boxplot',
  templateUrl: './basic-boxplot.component.html',
})
export class BasicBoxplotComponent {
  x = (d: DataRecord): number => d.x
  median = (d: DataRecord): number => d.median
  quartiles = (d: DataRecord): [number, number] => d.quartiles
  whiskers = (d: DataRecord): [number, number] => d.whiskers
  data = data
}
