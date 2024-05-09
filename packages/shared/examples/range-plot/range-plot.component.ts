import { Component } from '@angular/core'
import { Scale, Scatter } from '@unovis/ts'
import { data, DataRecord, processLineData, LineDataRecord } from './data'

const yScale = Scale.scalePoint([0, 800]).domain(data.map(d => d.occupation))
@Component({
  selector: 'range-plot',
  templateUrl: './range-plot.component.html',
})
export class RangePlotComponent {
  height = 1600
  data = data
  lineData = processLineData(data)
  legendItems = [{ name: 'Women', color: '#FF6B7E' }, { name: 'Men', color: '#4D8CFD' }]
  tooltipTriggers = {
    [Scatter.selectors.point]: (d: DataRecord): string => `
      Women average pay: $${Intl.NumberFormat().format(d.women)} </br>
      Men average pay: $${Intl.NumberFormat().format(d.men)} </br>
      Pay gap: $${Intl.NumberFormat().format(d.gap)}</br>
    `,
  }

  xLine = (d: LineDataRecord): number | undefined => d.x
  yLine = (d: LineDataRecord): number | undefined => yScale(d.y)

  y = (d: DataRecord): number | undefined => yScale(d.occupation)
  xWomen = (d: DataRecord): number => d.women
  xMen = (d: DataRecord): number => d.men
  tickFormat = (d: DataRecord, i: number): string => data[i].occupation
  tickNumber = data.length
}
