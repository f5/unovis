import { Axis, BulletLegend, Position, Scale, Scatter, Tooltip, XYContainer } from '@unovis/ts'
import { data, palette, DataRecord } from './data'

const categories = [...new Set(data.map((d: DataRecord) => d.category))].sort()
const colorScale = Scale.scaleOrdinal(palette).domain(categories)
const formatNumber = Intl.NumberFormat('en', { notation: 'compact' }).format

const container = document.getElementById('vis-container')

const title = document.createElement('h2')
title.innerText = 'American College Graduates, 2010-2012'
container.append(title)

const legend = new BulletLegend(container, {
  items: categories.map(v => ({ name: v, color: colorScale(v) })),
})

const scatter = new Scatter<DataRecord>({
  x: (d: DataRecord) => d.medianSalary,
  y: (d: DataRecord) => d.employmentRate,
  color: (d: DataRecord) => colorScale(d.category),
  size: (d: DataRecord) => d.total,
  label: (d: DataRecord) => formatNumber(d.total),
  labelPosition: Position.Bottom,
  sizeRange: [10, 50],
  cursor: 'pointer',
})

const chart = new XYContainer(container, {
  height: 600,
  components: [scatter],
  tooltip: new Tooltip({
    triggers: {
      [Scatter.selectors.point]: (d: DataRecord) => `
        ${d.major}<br/>Number of graduates: ${d.total.toLocaleString()}
      `,
    },
  }),
  xAxis: new Axis({
    label: 'Median Salary ($)',
    tickFormat: formatNumber,
    tickPadding: 0,
  }),
  yAxis: new Axis({ label: 'Average Employment Rate', tickPadding: 0 }),
}, data)
