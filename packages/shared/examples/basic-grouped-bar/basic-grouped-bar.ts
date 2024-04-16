import { XYContainer, Axis, GroupedBar, BulletLegend } from '@unovis/ts'
import { data, colors, capitalize, ElectionDatum } from './data'

const container = document.getElementById('vis-container')

const legendItems = Object.entries(colors).map(([n, c]) => ({
  name: capitalize(n),
  color: c,
}))
const legend = new BulletLegend(container, { items: legendItems })

const bar = new GroupedBar<ElectionDatum>({
  x: d => d.year,
  y: [d => d.republican, d => d.democrat, d => d.other, d => d.libertarian],
  color: (_, i) => legendItems[i].color,
})

const chart = new XYContainer(container, {
  components: [bar],
  height: '55vh',
  xAxis: new Axis({
    type: 'x',
    label: 'Election Year',
    numTicks: data.length,
  }),
  yAxis: new Axis({
    type: 'y',
    label: 'Number of Votes (millions)',
    tickFormat: (value: number) => (value / 10 ** 6).toFixed(1),
  }),
}, data)

