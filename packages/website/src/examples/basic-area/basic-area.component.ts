import { Component } from '@angular/core'
import { data, formats, DataRecord } from './data'

type Label = {
  color: string;
  label: string;
  value: number;
}

function configureLabels (): Record<number, Label> {
  // map formats to their maximum data records
  const peakItems = data.slice(0, data.length - 2).reduce((obj, d) => {
    formats.forEach(k => {
      obj[k] = d[k] > obj[k][k] ? d : obj[k]
    })
    return obj
  }, Object.fromEntries(formats.map(k => [k, data[0]])))

  // place labels at [x,y] where x = peak year and y = area midpoint
  return formats.reduce((obj, k, i) => {
    const offset = Array(i).fill(0).reduce((sum, _, j) => sum + peakItems[k][formats[j]], 0)
    const [x, y] = [peakItems[k].year, offset + peakItems[k][k] / 2]
    obj[x] = { label: k === 'cd' ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1), value: y, color: `var(--vis-color${i}` }
    return obj
  }, {})
}

@Component({
  selector: 'basic-area-chart',
  templateUrl: './basic-area.component.html',
})
export class BasicAreaComponent {
  data = data
  x = (d: DataRecord) => d.year
  y = formats.map(f => (d: DataRecord) => d[f])

  labelItems = configureLabels()
  labelY = (d: DataRecord): number=> this.labelItems[d.year]?.value ?? 0
  labelText = (d: DataRecord) => this.labelItems[d.year]?.label ?? ''
  labelColor = (d: DataRecord) => this.labelItems[d.year]?.color ?? 'none'
  noLabel = () => ''
}
