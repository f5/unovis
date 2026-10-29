// ECharts via echarts-for-react, tree-shaken: the documented `echarts-for-react/lib/core` entry +
// `echarts/core` with only the chart, components and renderer this chart uses.
import { createRoot } from 'react-dom/client'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { DATA, SERIES, getContainer } from '../shared/data.js'

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const option = {
  color: SERIES.map((s) => s.color),
  tooltip: { trigger: 'axis' },
  legend: {},
  xAxis: { type: 'category', data: DATA.map((d) => d.x) },
  yAxis: { type: 'value' },
  series: SERIES.map((s) => ({ type: 'line', name: s.label, data: DATA.map((d) => d[s.key]), smooth: true })),
}

function Chart () {
  return <ReactEChartsCore echarts={echarts} option={option} style={{ height: 300 }} />
}

createRoot(getContainer()).render(<Chart />)
