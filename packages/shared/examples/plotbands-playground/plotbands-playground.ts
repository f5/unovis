import { Axis, Line, Plotband, XYContainer } from '@unovis/ts'
import { data, DataRecord } from './data'

const container = document.getElementById('vis-container')

const line = new Line<DataRecord>({
  x: d => d.x,
  y: d => d.y,
})

const xPlotband = new Plotband<DataRecord>({
  from: 4,
  to: 6,
  labelText: 'Plot band on x-axis',
  axis: 'x',
  labelPosition: 'top-inside',
})

const yPlotband = new Plotband<DataRecord>({
  from: 1,
  to: 3,
  color: 'rgba(34, 99, 182, 0.3)',
  labelText: 'Plot band on y-axis',
  labelPosition: 'left-inside',
})

const chart = new XYContainer(container, {
  components: [line, xPlotband, yPlotband],
  xAxis: new Axis(),
  yAxis: new Axis(),
}, data)
