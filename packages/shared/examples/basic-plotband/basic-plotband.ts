import { Axis, Line, Plotband, XYContainer } from '@unovis/ts'
import { data, DataRecord } from './data'

const container = document.getElementById('vis-container')

const line = new Line<DataRecord>({
  x: d => d.x,
  y: d => d.y,
})

const plotband = new Plotband<DataRecord>({
  from: 3,
  to: 5,
  labelText: 'Plot Band',
})

const chart = new XYContainer(container, {
  components: [line, plotband],
  xAxis: new Axis(),
  yAxis: new Axis(),
}, data)
