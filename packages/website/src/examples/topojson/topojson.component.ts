import { Component } from '@angular/core'
import { Scale, TopoJSONMap } from '@volterra/vis'

import { data, ageRange, yearRange, AreaDatum } from './data'

const yearIndex = Scale.scaleLinear()
    .domain(yearRange)
    .rangeRound([0, yearRange[1] - yearRange[0]])

@Component({
  selector: 'topojson',
  templateUrl: './topojson.html',
  styleUrls: ['./styles.css'],
})
export class TopojsonComponent {
  color = Scale.scaleSequential(['#ffe991', '#006e8d']).domain(ageRange)
  currentYear = 2019
  mapData = { areas: data }
  tooltipTriggers = {
    [TopoJSONMap.selectors.feature]: d =>
      `${d.properties.name}: ${d.data ? this.getExpectancy(d.data) : 'no data'}`
    ,
  }

  // accessors
  getExpectancy = (d: AreaDatum) => d.age[yearIndex(this.currentYear)]
  getAreaColor = (d: AreaDatum) => this.color(this.getExpectancy(d))

  // input config
  min: number = yearRange[0]
  max: number = yearRange[1]
  setYear = (e: InputEvent) => this.currentYear = e.target.value
  
  // legend config
  getGradientColor = (_, i: number): string => this.color(i)
  gradientSteps: number[] = Array(100).fill(1)
  numLabels: number = (ageRange[1] - ageRange[0]) / 5
}
