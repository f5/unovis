// Copyright (c) Volterra, Inc. All rights reserved.
import { AfterViewInit, Component } from '@angular/core'

// Vis
import { Axis, Tooltip, Area, AreaConfigInterface } from '@volterra/vis/components'

// Helpers
import { SampleDatum, sampleSeriesData } from '../../utils/data'

function getAreaConfig (n): AreaConfigInterface<SampleDatum> {
  return {
    x: d => d.x,
    y: new Array(n).fill(0).map((d, i) => {
      return d => d[`y${i || ''}`]
    }),
  }
}

function sampleManyAreaData (n) {
  const data = sampleSeriesData(30)
  data.forEach(d => {
    for (let i = 5; i < n - 5; i++) {
      d[`y${i}`] = Math.random()
    }
  })
  return data
}

@Component({
  selector: 'area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.css'],
})

export class AreaComponent implements AfterViewInit {
  title = 'area'
  margin = { top: 10, bottom: 10, left: 10, right: 10 }
  dimensions: {}
  data: SampleDatum[] = sampleManyAreaData(50)

  zeroDataConfig = getAreaConfig(0)
  zeroDataStacked = new Area(this.zeroDataConfig)
  zeroDataComponents = [this.zeroDataStacked]
  zeroDataAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  singleDataConfig = getAreaConfig(1)
  singleDataStacked = new Area(this.singleDataConfig)
  singleDataComponents = [this.singleDataStacked]
  singleDataAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  dynamicDataConfig = getAreaConfig(10)
  dynamicDataStacked = new Area(this.dynamicDataConfig)
  dynamicDataComponents = [this.dynamicDataStacked]
  dynamicDataAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  manyDataConfig = getAreaConfig(40)
  manyDataStacked = new Area(this.manyDataConfig)
  manyDataComponents = [this.manyDataStacked]
  manyDataAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  fewDataConfig = getAreaConfig(10)
  fewDataStacked = new Area(this.fewDataConfig)
  fewDataComponents = [this.fewDataStacked]
  fewDataAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  tooltip = new Tooltip({
    triggers: {
      [Area.selectors.area]: (): string => '<span>Area</span>',
    },
  })

  ngAfterViewInit (): void {
    let count = 0
    setInterval(() => {
      this.dynamicDataConfig = getAreaConfig(count % 2 ? 10 : 0)
      count += 1
    }, 2000)
  }
}
