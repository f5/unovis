import { AfterViewInit, Component } from '@angular/core'
import _times from 'lodash-es/times'

// Vis
import { Area, AreaConfigInterface, Axis } from '@unovis/ts'

// Helpers
import { SampleDatum } from '../../utils/data'

function sampleAreaData (n: number): SampleDatum[] {
  const data = _times(30).map((i) => ({
    x: i,
    y: Math.random(),
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
    cursor: (d, i) => i % 2 ? 'pointer' : null,
  }
}

@Component({
  selector: 'areachart',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.css'],
})

export class AreaComponent implements AfterViewInit {
  title = 'area'
  component = Area

  configGenerator = getAreaConfig
  dataGenerator = sampleAreaData
  axesGenerator = (): { x: Axis<SampleDatum>; y: Axis<SampleDatum> } => ({
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  })

  ngAfterViewInit (): void {
    //
  }
}
