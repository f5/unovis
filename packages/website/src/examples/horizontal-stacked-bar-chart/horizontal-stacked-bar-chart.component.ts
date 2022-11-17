import { Component } from '@angular/core'
import { StackedBar } from '@unovis/ts'
import { data, labels, EducationDatum } from './data'

@Component({
  selector: 'horizontal-stacked-bar-chart',
  templateUrl: './horizontal-stacked-bar-chart.component.html',
})
export class StackedBarChartComponent {
  dataKeys = Object.keys(labels)
  data: EducationDatum[] = data

  x = (d: EducationDatum): number => this.data.indexOf(d)
  y = this.dataKeys.map(k => (d: EducationDatum) => d[k])

  legendLabels = this.dataKeys.map(k => ({ name: labels[k] }))

  tooltipTriggers = {
    [StackedBar.selectors.bar]: (d: EducationDatum): string => {
      const title = `<div style="color: #666; text-align: center">${d.country}</div>`
      const total = `Total: <b>${d.total}%</b> of population</br>`
      const stats = this.dataKeys.map((k, i) => [
        labels[k].split(' ')[0],
        `<span style="color: var(--vis-color${i}); font-weight: 800">${d[k]}%</span>`,
      ]).join(' | ')
      return `<div style="font-size: 12px">${title}${total}${stats}</div>`
    },
  }

  tickFormat = (i: number): string => data[i].country
}
