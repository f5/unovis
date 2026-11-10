import { Component } from '@angular/core'

import { data, DataRecord, formatDay, formatRevenue, tooltipTemplate } from './data'
import { CHART_HEIGHT } from './constants'

@Component({
  selector: 'native-tooltip-content',
  templateUrl: './native-tooltip-content.component.html',
  styleUrls: ['./styles.css'],
  standalone: false,
})
export class NativeTooltipContentComponent {
  data = data
  height = CHART_HEIGHT
  tooltipTemplate = tooltipTemplate

  x = (d: DataRecord): number => d.day
  y = (d: DataRecord): number => d.revenue
  formatDay = formatDay
  formatRevenue = formatRevenue
  formatTick = (value: number | Date): string => formatRevenue(Number(value))
}
