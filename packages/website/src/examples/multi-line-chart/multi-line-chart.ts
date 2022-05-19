import { Axis, BulletLegend, Line, XYContainer } from '@volterra/vis'
import { data, labels, CityTemps } from './data'

const container = document.getElementById('#vis-container')

const line = new Line<CityTemps>({
  x: (d: CityTemps) => +(new Date(d.date)),
  y: [
    (d: CityTemps) => d.austin,
    (d: CityTemps) => d.ny,
    (d: CityTemps) => d.sf,
  ],
})

const legend = new BulletLegend(container, {
  items: ['austin', 'ny', 'sf'].map(city => ({ name: labels[city] })),
})

const chart = new XYContainer(container, {
  components: [line],
  xAxis: new Axis({
    label: 'Date',
    numTicks: 5,
    tickFormat: d => Intl.DateTimeFormat().format(new Date(d)),
  }),
  yAxis: new Axis({
    label: 'Temperature (celsuis)',
  }),
  height: 300,
}, data)
