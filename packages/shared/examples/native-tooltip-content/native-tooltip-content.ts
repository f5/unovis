import { Axis, Crosshair, Line, Scatter, Tooltip, XYContainer } from '@unovis/ts'

import { data, DataRecord, formatDay, formatRevenue, tooltipTemplate } from './data'
import { CHART_HEIGHT } from './constants'
import './styles.css'

const container = document.getElementById('vis-container') as HTMLElement
container.classList.add('native-tooltip-content')
const heading = document.createElement('h4')
heading.textContent = 'Daily revenue'
const hint = document.createElement('p')
hint.className = 'hint'
hint.textContent = 'Move across the chart to inspect daily revenue.'
const chartContainer = document.createElement('div')
container.append(heading, hint, chartContainer)

const x = (d: DataRecord): number => d.day
const y = (d: DataRecord): number => d.revenue
const tooltip = new Tooltip({
  className: 'native-tooltip-content-popup',
})

export const chart = new XYContainer(chartContainer, {
  height: CHART_HEIGHT,
  components: [new Line<DataRecord>({ x, y }), new Scatter<DataRecord>({ x, y, size: 8 })],
  xAxis: new Axis<DataRecord>({ tickFormat: formatDay, numTicks: 7 }),
  yAxis: new Axis<DataRecord>({ tickFormat: value => formatRevenue(Number(value)) }),
  crosshair: new Crosshair<DataRecord>({ x, y, template: tooltipTemplate }),
  tooltip,
}, data)
