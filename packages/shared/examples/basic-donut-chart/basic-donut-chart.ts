import { Donut, SingleContainer, BulletLegend } from '@unovis/ts'
import { data, DataRecord } from './data'
import './styles.css'

const container = document.getElementById('vis-container')
container.classList.add('donut-chart')
container.innerHTML = '<h3>Most Common Password Categories</h3>'

const legendItems = Object.entries(data).map(([_, data]) => ({
  name: data.key.charAt(0).toUpperCase() + data.key.slice(1),
}))
const legend = new BulletLegend(container, { items: legendItems })

const chart = new SingleContainer(container, {
  component: new Donut<DataRecord>({
    value: (d: DataRecord) => d.value,
    icon: (d: DataRecord) => d.icon,
    showEmptySegments: true,
    padAngle: 0.01,
    arcWidth: 100,
  }),
  height: 400,
}, data)
