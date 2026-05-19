import { RadialBar, RadialBarArcDatum, SingleContainer, BulletLegend, Tooltip } from '@unovis/ts'
import { data, DataRecord, maxValue, completion } from './data'

const container = document.getElementById('vis-container') as HTMLElement

const legendItems = data.map(d => ({ name: d.key }))
const legend = new BulletLegend(container, { items: legendItems })

const radialBar = new RadialBar<DataRecord>({
  value: (d: DataRecord) => d.value,
  maxValue,
  trackWidth: 18,
  trackPadding: 4,
  cornerRadius: 9,
  centralLabel: `${completion}%`,
  centralSubLabel: 'daily goals',
})

const tooltip = new Tooltip({
  triggers: {
    [RadialBar.selectors.bar]: (d: RadialBarArcDatum<DataRecord>) => {
      const max = maxValue[d.index] ?? '—'
      return `<strong>${d.data.key}</strong><br/>${d.value} / ${max} ${d.data.unit}`
    },
  },
})

const chart = new SingleContainer(container, {
  component: radialBar,
  tooltip,
  height: 400,
}, data)
