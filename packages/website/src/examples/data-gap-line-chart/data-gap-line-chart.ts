import { Axis, BulletLegend, Line, XYContainer, XYLabels } from '@unovis/ts'
import { data, countries, legendItems, Country, DataRecord } from './data'

const container = document.getElementById('vis-container')

function yAccessor (c: Country): (d: DataRecord) => number {
  return (d: DataRecord) => d[c.id]
}

// Fallback Value Switch
const div = document.createElement('div')
div.className = 'fallbackValueSwitch'
container.appendChild(div)
div.innerHTML = 'Select a fallback value for missing data points: '
const legend = new BulletLegend(div)

// Line chart
const line = new Line<DataRecord>({
  x: (d: DataRecord) => d.year,
  y: countries.map(yAccessor),
})

// XY Labels
const labels = new XYLabels<Country>({
  x: 2019.5,
  y: (c: Country) => yAccessor(c)(data[data.length - 1]),
  label: (c: Country) => c.label,
  backgroundColor: 'none',
})
labels.setData(countries)

// Container
const chart = new XYContainer(container, {
  height: 300,
  xDomain: [1961, 2022],
  yDomain: [0, 650],
  components: [line, labels],
  xAxis: new Axis({ numTicks: 10 }),
  yAxis: new Axis({
    label: 'National Cereal Production, tons',
    tickFormat: (d: number) => `${d}${d ? 'M' : ''}`,
    tickValues: [0, 200, 400, 600],
  }),
}, data)

function setFallbackValue (index: number): void {
  legend.update({
    items: legendItems.map((o, i) => ({
      name: o.name,
      inactive: index !== i,
      color: countries[0].color,
    })),
    onLegendItemClick: (_, i: number) => setFallbackValue(i),
  })
  line.setConfig({ ...line.config, fallbackValue: legendItems[index].value })
  line.render()
}

setFallbackValue(0)
