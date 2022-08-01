import { Component } from '@angular/core'
import {data, formats, DataRecord, getLabels} from './data'

@Component({
  selector: 'basic-area-chart',
  templateUrl: './basic-area.component.html',
})
export class BasicAreaComponent {
  data = data
  x = (d: DataRecord) => d.year
  y = formats.map(f => (d: DataRecord) => d[f])

  labelItems = getLabels(this.data)
  labelY = (d: DataRecord): number=> this.labelItems[d.year]?.value ?? 0
  labelText = (d: DataRecord) => this.labelItems[d.year]?.label ?? ''
  labelColor = (d: DataRecord) => this.labelItems[d.year]?.color ?? 'none'
  noLabel = () => ''
}
