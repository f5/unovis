// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { AfterViewInit, Component } from '@angular/core'

// Vis
import { Line } from '@volterra/vis/components'

import _times from 'lodash/times'

function sampleLineData (n: number): [] {
  const data = _times(30).map((i) => ({
    x: i,
  }))
  data.forEach(d => {
    for (let i = 0; i < n; i++) {
      d[`y${i}`] = Math.random()
    }
  })
  return data
}

function getLineConfig (n: number) {
  return {
    x: d => d.x,
    y: _times(n).map((d, i) => {
      return d => d[`y${i}`]
    }),
  }
}

@Component({
  selector: 'line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.css'],
})

export class LineComponent implements AfterViewInit {
  title = 'line'
  component = Line

  configGenerator = getLineConfig
  dataGenerator = sampleLineData

  ngAfterViewInit (): void {}
}
