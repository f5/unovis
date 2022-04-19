/* eslint-disable */
import { AfterViewInit, Component } from '@angular/core'

// Vis
import { Line, Axis } from '@volterra/vis'

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
    cursor: (d, i) => i % 2 ? 'pointer' : null,
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
  axesGenerator = () => ({
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  })

  ngAfterViewInit (): void {}
}
