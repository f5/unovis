import { Axis, BulletLegend, Scatter, XYContainer } from '@unovis/ts'
import { data, DataRecord } from './data'

const container = document.getElementById('vis-container')

// Legend
const legend = new BulletLegend(container, {
  items: [
    { name: 'Male', color: '#1fc3aa' },
    { name: 'Female', color: '#8624F5' },
    { name: 'No Data', color: '#aaa' },
  ],
})

// Chart
const chart = new XYContainer<DataRecord>(container, {
  height: 600,
  components: [
    new Scatter({
      x: (d: DataRecord) => d.beakLength,
      y: (d: DataRecord) => d.flipperLength,
      color: (d: DataRecord) => legend.config.items.find(i => i.name === (d.sex ?? 'No Data'))?.color,
      size: 8,
    }),
  ],
  xAxis: new Axis({ label: 'Beak Length (mm)' }),
  yAxis: new Axis({ label: 'Flipper Length (mm)' }),
}, data)
