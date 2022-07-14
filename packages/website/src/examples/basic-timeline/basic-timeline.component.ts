import { Component } from '@angular/core'
import { Timeline } from '@volterra/vis'
import { colorMap, data, DataRecord, ProductType } from './data'

@Component({
  selector: 'basic-timeline',
  templateUrl: './basic-timeline.component.html'
})
export class BasicTimelineComponent {
  labelWidth = 220
  dateFormatter = Intl.DateTimeFormat().format

  data: DataRecord[] = data
  x = (d: DataRecord) => d.startDate
  length = (d: DataRecord) => d.endDate - d.startDate
  type = (d: DataRecord) => d.name
  color = (d: DataRecord) => colorMap[d.type]

  legendItems = Object.keys(ProductType).map((name, i) => ({ name, color: colorMap[name] }))
  triggers = {
    [Timeline.selectors.label]: (_: string, i: number) => {
      const { startDate, endDate, description } = data[i]
      return `
        <div style="width:${this.labelWidth}px">
          ${[startDate, endDate].map(this.dateFormatter).join(' - ')}
          ${description}
        </div>`
    },
  }
}
