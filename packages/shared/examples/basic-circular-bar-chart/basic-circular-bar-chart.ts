import { CircularBar, CircularBarArcDatum, SingleContainer, BulletLegend, Tooltip } from '@unovis/ts'
import { data, DataRecord, maxValue } from './data'
import './styles.css'

const container = document.getElementById('vis-container') as HTMLElement
container.classList.add('circular-bar-chart')

const legendItems = data.map(d => ({ name: d.key, color: d.color }))
const legend = new BulletLegend(container, { items: legendItems })

const circularBar = new CircularBar<DataRecord>({
  value: (d: DataRecord) => d.value,
  maxValue,
  color: (d: DataRecord) => d.color,
  icon: (d: DataRecord) => d.icon,
})

const tooltip = new Tooltip({
  triggers: {
    [CircularBar.selectors.bar]: (d: CircularBarArcDatum<DataRecord>) => {
      const max = maxValue[d.index] ?? '—'
      return `<strong>${d.data.key}</strong><br/>${d.value} / ${max} ${d.data.unit}`
    },
  },
})

const chart = new SingleContainer(container, {
  component: circularBar,
  tooltip,
  height: 400,
}, data)
