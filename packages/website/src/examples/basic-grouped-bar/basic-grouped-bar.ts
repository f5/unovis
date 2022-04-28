import { XYContainer, Axis, GroupedBar, BulletLegend } from '@volterra/vis'
import { data, colors, ElectionDatum } from './data'

const container = document.getElementById('#vis-container')

const legendItems = Object.entries(colors).map(([n, c]) => ({
  name: n.toUpperCase(),
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
  xAxis: new Axis({
    type: 'x',
    label: 'Election Year',
    tickValues: data.map(d => d.year),
  }),
  yAxis: new Axis({
    type: 'y',
    label: 'Number of Votes (millions)',
    tickFormat: (i: number) => `${i / Math.pow(10, 6)}.0`,
  }),
}, data)

