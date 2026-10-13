// ECharts (vanilla), tree-shaken via `echarts/core` + echarts.use([...]) (ECharts' documented approach).
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { DATA, SERIES, getContainer } from '../shared/data.js'

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

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
