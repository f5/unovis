// Copyright (c) Volterra, Inc. All rights reserved.
import { AfterViewInit, Component } from '@angular/core'
import _times from 'lodash/times'

// Vis
import { Area, AreaConfigInterface } from '@volterra/vis/components'

// Helpers
import { SampleDatum } from '../../utils/data'

function sampleAreaData (n: number): SampleDatum[] {
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

function getAreaConfig (n: number): AreaConfigInterface<SampleDatum> {
  return {
    x: d => d.x,
    y: _times(n).map((d, i) => {
      return d => d[`y${i}`]
    }),
  }
}

@Component({
  selector: 'area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.css'],
})

export class AreaComponent implements AfterViewInit {
  title = 'area'
  component = Area

  configGenerator = getAreaConfig
  dataGenerator = sampleAreaData

  ngAfterViewInit (): void {}
}
