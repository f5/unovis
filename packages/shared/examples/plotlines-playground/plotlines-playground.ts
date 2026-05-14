import { Axis, Line, Plotline, XYContainer } from '@unovis/ts'
import { data, DataRecord } from './data'

const container = document.getElementById('vis-container')

const line = new Line<DataRecord>({
  x: d => d.x,
  y: d => d.y,
})

const yPlotline = new Plotline<DataRecord>({
  value: 6,
  color: 'rgba(7, 114, 21, 1)',
  labelText: 'Plot line on y-axis',
  labelPosition: 'top-left',
})

const xPlotline = new Plotline<DataRecord>({
  value: 10,
  color: 'rgba(220, 114, 0, 1)',
  axis: 'x',
  labelOrientation: 'vertical',
  labelText: 'Plot line on x-axis',
})

const chart = new XYContainer(container, {
  components: [line, yPlotline, xPlotline],
  xAxis: new Axis(),
  yAxis: new Axis(),
}, data)
