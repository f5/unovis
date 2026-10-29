// Unovis (vanilla TypeScript/JavaScript): @unovis/ts
import { XYContainer, Line, Axis, Crosshair, Tooltip, BulletLegend } from '@unovis/ts'
import { DATA, SERIES, getContainer } from '../shared/data.js'

const x = (d) => d.x
const y = SERIES.map((s) => (d) => d[s.key])
const color = (_, i) => SERIES[i].color
const tooltipTemplate = (d) => [`<b>${d.x}</b>`, ...SERIES.map((s) => `${s.label}: ${d[s.key]}`)].join('<br>')

const legendElement = document.createElement('div')
const chartElement = document.createElement('div')
getContainer().append(legendElement, chartElement)

// eslint-disable-next-line no-new
new BulletLegend(legendElement, { items: SERIES.map((s) => ({ name: s.label, color: s.color })) })

// eslint-disable-next-line no-new
new XYContainer(chartElement, {
  height: 300,
  components: [new Line({ x, y, color })],
  xAxis: new Axis({ type: 'x' }),
  yAxis: new Axis({ type: 'y' }),
  crosshair: new Crosshair({ template: tooltipTemplate, color }),
  tooltip: new Tooltip(),
}, DATA)
