import { Axis, Line, Plotline, LabelOverflow, XYContainer } from '@unovis/ts'
import { data, thresholds, DataRecord } from './data'

const container = document.getElementById('vis-container')

const line = new Line<DataRecord>({ x: d => d.x, y: d => d.y })

const plotlines = thresholds.map(t => new Plotline<DataRecord>({
  value: t.value,
  labelText: t.label,
  labelPosition: 'top-right',
  labelAutoPosition: true,
  labelOverflow: LabelOverflow.Smart,
  color: '#666',
  lineStyle: 'dash',
}))

const chart = new XYContainer<DataRecord>(container, {
  components: [line, ...plotlines],
  xAxis: new Axis(),
  yAxis: new Axis(),
  height: 400,
  margin: { top: 10, right: 200, bottom: 30, left: 40 },
  yDomain: [5.0, 7.0],
}, data)
