// Reference (not tree-shaken): the full `echarts` entry (all charts, components and both renderers).
import * as echarts from 'echarts'
import { DATA, SERIES, getContainer } from '../shared/data.js'

const element = document.createElement('div')
element.style.height = '300px'
getContainer().append(element)

const chart = echarts.init(element)
chart.setOption({
  color: SERIES.map((s) => s.color),
  tooltip: { trigger: 'axis' },
  legend: {},
  xAxis: { type: 'category', data: DATA.map((d) => d.x) },
  yAxis: { type: 'value' },
  series: SERIES.map((s) => ({ type: 'line', name: s.label, data: DATA.map((d) => d[s.key]), smooth: true })),
})
window.addEventListener('resize', () => chart.resize())
