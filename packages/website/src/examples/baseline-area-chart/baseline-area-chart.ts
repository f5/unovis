import { Area, Axis, BulletLegend, CurveType, XYContainer } from '@unovis/ts'

import { data, categories, Category, DataRecord } from './data'

// Configure baseline and tick values
const sums = data.map(d => d.art.reduce((t, i) => t + i, 0))
const max = Math.max(...sums)
const yTicks = Array(Math.round(max / 1000)).fill(0).map((_, i) => {
  const dir = i % 2 === 1 ? -(i - 1) : i
  return max / 2 + dir * 1000
})

const container = document.getElementById('vis-container')

// Legend
const legend = new BulletLegend(container, { items: categories })

// Area
const area = new Area<DataRecord>({
  x: d => d.year,
  y: categories.map((c: Category) => d => d.art[c.id]),
  baseline: (_: DataRecord, i: number) => (max - sums[i]) / 2,
  curveType: CurveType.Basis,
})

// Container
const chart = new XYContainer(container, {
  height: 500,
  components: [area],
  xAxis: new Axis({ label: 'Year' }),
  yAxis: new Axis({
    label: 'Number of Works Acquired',
    tickValues: yTicks,
    tickFormat: (i: number) => `${Math.abs(i - max / 2)}`,
  }),
}, data)
