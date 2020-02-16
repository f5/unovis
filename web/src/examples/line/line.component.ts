// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { AfterViewInit, Component } from '@angular/core'

// Vis
import { Axis, Tooltip, Line, LineConfigInterface } from '@volterra/vis/components'

// Helpers
import { SampleDatum, sampleSeriesData } from '../../utils/data'

function getLineConfig (n): LineConfigInterface<SampleDatum> {
  return {
    x: d => d.x,
    y: new Array(n).fill(0).map((d, i) => {
      return d => d[`y${i || ''}`]
    }),
    events: {
      [Line.selectors.line]: {
        click: d => { },
      },
    },
  }
}

function sampleManyLineData(n) {
  const data = sampleSeriesData(30)
  data.forEach(d => {
    for (let i = 5; i < n - 5; i++) {
      d[`y${i}`] = Math.random()
    }
  })
  
  return data
}

@Component({
  selector: 'line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.css'],
})

export class LineComponent implements AfterViewInit {
  title = 'line'
  margin = { top: 10, bottom: 10, left: 10, right: 10 }
  dimensions: {}
  data: SampleDatum[] = sampleManyLineData(150)

  zeroLineConfig = getLineConfig(0)
  zeroLine = new Line(this.zeroLineConfig)
  zeroLineComponents = [this.zeroLine]
  zeroLineAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  singleLineConfig = getLineConfig(1)
  singleLine = new Line(this.singleLineConfig)
  singleLineComponents = [this.singleLine]
  singleLineAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  dynamicLineConfig = getLineConfig(5)
  dynamicLine = new Line(this.dynamicLineConfig)
  dynamicLineComponents = [this.dynamicLine]
  dynamicLineAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  manyLineConfig = getLineConfig(150)
  manyLine = new Line(this.manyLineConfig)
  manyLineComponents = [this.manyLine]
  manyLineAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  fewLineConfig = getLineConfig(15)
  fewLine = new Line(this.fewLineConfig)
  fewLineComponents = [this.fewLine]
  fewLineAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  tooltip = new Tooltip({
    triggers: {
      [Line.selectors.line]: (): string => '<span>Line</span>',
    },
  })

  ngAfterViewInit (): void {
    let count = 0
    setInterval(() => {
      this.dynamicLineConfig = getLineConfig(count%2 ? 5 : 0)
      count += 1
    }, 2000)
  }
}
