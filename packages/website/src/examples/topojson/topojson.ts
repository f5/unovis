import { Axis, Orientation, Scale, SingleContainer, StackedBar, Tooltip, TopoJSONMap, WorldMapTopoJSON, XYContainer } from '@volterra/vis'
import { AreaDatum, data, yearRange, ageRange } from './data'

import './styles.css'

const colorScale = Scale.scaleSequential(['#ffe991', '#006e8d']).domain(ageRange)
const yearScale = Scale.scaleLinear()
  .domain(yearRange)
  .rangeRound([0, yearRange[1] - yearRange[0]])

const year = {
  value: 2019,
  getExpectancy: function (d: AreaDatum): number {
    return d.age[yearScale(this.value)]
  },
}

const container = document.getElementById('#vis-container')

const slider = container.appendChild(document.createElement('header'))
const chart = container.appendChild(document.createElement('div'))
const legend = container.appendChild(document.createElement('div'))

// configure main chart
const map = new TopoJSONMap<AreaDatum, undefined, undefined>({
  topojson: WorldMapTopoJSON,
  areaColor: (d: AreaDatum) => colorScale(year.getExpectancy(d)),
  disableZoom: true,
})
const mapContainer = new SingleContainer(chart, {
  component: map,
  tooltip: new Tooltip({
    triggers: {
      [TopoJSONMap.selectors.feature]: d =>
        `${d.properties.name}: ${d.data ? year.getExpectancy(d.data) : 'no data'}`
      ,
    },
  }),
  height: 550,
}, { areas: data })

// configure year slider
const title = slider.appendChild(document.createElement('h2'))
title.innerHTML = 'Life expectancy by Country, <em id="yearLabel">2019</em>'

const yearSlider = slider.appendChild(document.createElement('input'))
yearSlider.setAttribute('type', 'range')
yearSlider.setAttribute('min', yearRange[0].toString())
yearSlider.setAttribute('max', yearRange[1].toString())
yearSlider.setAttribute('id', 'year')
yearSlider.setAttribute('value', '2019')
yearSlider.addEventListener('change', function () {
  document.getElementById('yearLabel').innerText = this.value
  year.value = Number(this.value)
  map.render(0)
})

// configure gradient
const gradientLegend = new XYContainer(legend, {
  height: 70,
  width: 500,
  xDomain: ageRange,
  components: [new StackedBar({
    x: 0.5,
    y: Array(100).fill(1),
    color: (_, i: number) => colorScale(i),
    orientation: Orientation.Horizontal,
  })],
  xAxis: new Axis({
    position: 'top',
    numTicks: (ageRange[1] - ageRange[0]) / 5,
    label: 'Life expectancy (years)',
    tickPadding: 0,
  }),
}, [{}])
