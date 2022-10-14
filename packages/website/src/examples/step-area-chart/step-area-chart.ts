import { Axis, Area, BulletLegend, CurveType, XYContainer, BulletLegendItemInterface } from '@unovis/ts'
import { data, candidates, DataRecord } from './data'

import './styles.css'

const items = Object.keys(data[0][candidates[0].name]).map(c => ({ name: c }))

const container = document.getElementById('vis-container')

// Basic legend
const panel = document.createElement('div')
panel.className = 'panel'
container.append(panel)
const legend = new BulletLegend(panel, { items })

// Interactive legend
const legendSwitch = document.createElement('div')
legendSwitch.className = 'legendSwitch'
panel.appendChild(legendSwitch)
const clickableLegend = new BulletLegend(legendSwitch)

// Area
const area = new Area<DataRecord>({
  x: d => d.year,
  y: [],
  curveType: CurveType.StepAfter,
})

const chart = new XYContainer(container, {
  height: 300,
  yDomain: [0, 42],
  components: [area],
  xAxis: new Axis({ label: 'Year' }),
  yAxis: new Axis({ label: 'Number of Mentions' }),
}, data)

function setCandidate (curr: string): void {
  // update legend
  clickableLegend.update({
    labelClassName: 'legendLabel',
    items: candidates.map(c => ({ ...c, inactive: curr !== c.name })),
    onLegendItemClick: (i: BulletLegendItemInterface) => setCandidate(i.name),
  })
  // update area y accessors
  area.setConfig({
    ...area.config,
    y: items.map((i: BulletLegendItemInterface) => (d: DataRecord) => d[curr][i.name]),
  })
  area.render()
}

setCandidate(candidates[0].name)
