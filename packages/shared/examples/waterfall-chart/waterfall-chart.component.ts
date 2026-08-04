import { Component } from '@angular/core'
import { FitMode, StackedBar } from '@unovis/ts'

import { barTooltip, data, stepColor, WaterfallDatum } from './data'

@Component({
  selector: 'waterfall-chart',
  templateUrl: './waterfall-chart.component.html',
  standalone: false,
})
export class WaterfallChartComponent {
  data = data

  // Every bar starts where the previous one ended, so `baseline` carries the running total
  x = (d: WaterfallDatum): number => d.index
  y = (d: WaterfallDatum): number => d.value
  baseline = (d: WaterfallDatum): number => d.start
  color = stepColor

  triggers = {
    [StackedBar.selectors.bar]: barTooltip,
  }

  // X Axis
  tickValues = data.map(d => d.index)
  tickFormat = (tick: number | Date): string => data[+tick]?.label ?? ''
  tickTextFitMode = FitMode.Wrap

  // Y Axis
  yTickFormat = (tick: number | Date): string => `${+tick}`
}
