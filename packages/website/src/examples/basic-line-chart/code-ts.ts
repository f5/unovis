import { Line, XYContainer } from '@volterra/vis'
import { data, DataRecord } from './data'

const container = document.body
const line = new Line<DataRecord>({
  x: d => d.x,
  y: d => d.y,
})

const chart = new XYContainer(container, {
  components: [line],
}, data)
