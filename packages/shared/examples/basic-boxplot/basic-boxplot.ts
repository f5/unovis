import { Axis, Boxplot, XYContainer } from '@unovis/ts'
import { data, DataRecord } from './data'

const container = document.getElementById('vis-container')

const boxplot = new Boxplot<DataRecord>({
  x: d => d.x,
  median: d => d.median,
  quartiles: d => d.quartiles,
  whiskers: d => d.whiskers,
})

const chart = new XYContainer(container, {
  components: [boxplot],
  xAxis: new Axis(),
  yAxis: new Axis(),
}, data)
