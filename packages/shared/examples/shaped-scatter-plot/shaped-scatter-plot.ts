import { Axis, BulletLegend, Position, Scale, Scatter, Tooltip, XYContainer, colors } from '@unovis/ts'
import { data, DataRecord, shapes, categories, sumCategories } from './data'

const shapeScale = Scale.scaleOrdinal(shapes).domain(categories)
const colorScale = Scale.scaleOrdinal(colors).domain(categories)
const container = document.getElementById('vis-container')

const title = document.createElement('h2')
title.innerText = 'The Rise and Rise of A.I. Large Language Models'
container.append(title)

const legend = new BulletLegend(container, {
  items: categories.map(v => ({ name: v, shape: shapeScale(v) })),
})

const scatter = new Scatter<DataRecord>({
  x: (d: DataRecord) => +(new Date(d.date)),
  y: (d: DataRecord) => d.trainedParam,
  color: (d: DataRecord) => colorScale(sumCategories(d.owner)),
  shape: (d: DataRecord) => shapeScale(sumCategories(d.owner)),
  size: 15,
  label: (d: DataRecord) => d.name,
  cursor: 'pointer',
})

const chart = new XYContainer(container, {
  height: 600,
  components: [scatter],
  tooltip: new Tooltip({
    triggers: {
      [Scatter.selectors.point]: (d: DataRecord) => `
      <strong>name</strong>: ${d.name} <br>
      <strong>owner</strong>: ${d.owner} <br>
      <strong>bn parameters</strong>: ${d.trainedParam}`,
    },
  }),
  xAxis: new Axis({
    label: 'Date Released',
    tickFormat: Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format,
    tickPadding: 0,
  }),
  yAxis: new Axis({ label: 'Billion Parameters', tickPadding: 0 }),
}, data)
