import { Axis, Line, Plotband, XYContainer, Plotline } from '@unovis/ts'
import { data, DataRecord } from './data'

const container = document.getElementById('vis-container')

const line = new Line<DataRecord>({
  x: d => d.x,
  y: d => d.y,
})

const firstPlotband = new Plotband<DataRecord>({
  from: 4,
  to: 6,
  labelText: 'Plot band on x-axis',
  axis: 'x',
  labelPosition: 'top-inside',
})

const secondPlotband = new Plotband<DataRecord>({
  from: 1,
  to: 3,
  color: 'rgba(34, 99, 182, 0.3)',
  labelText: 'Plot band on y-axis',
  labelPosition: 'left-inside',
})

const firstPlotline = new Plotline<DataRecord>({
  value: 6,
  color: 'rgba(7, 114, 21, 1)',
  labelText: 'Plot line on y-axis',
  labelPosition: 'top-left',
})

const secondPlotline = new Plotline<DataRecord>({
  value: 10,
  color: 'rgba(220, 114, 0, 1)',
  axis: 'x',
  labelOrientation: 'vertical',
  labelText: 'Plot line on x-axis',
})

const chart = new XYContainer(container, {
  components: [line, firstPlotband, secondPlotband, firstPlotline, secondPlotline],
  xAxis: new Axis(),
  yAxis: new Axis(),
}, data)
