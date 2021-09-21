// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { AfterViewInit, Component } from '@angular/core'

// Vis
import { Axis, Timeline, TimelineConfigInterface } from '@volterra/vis'

// Helpers
import { sampleTimelineData, SampleTimelineDatum } from '../../utils/data'

function getTimelineConfig (): TimelineConfigInterface<SampleTimelineDatum> {
  return {
    x: d => d.time,
    length: d => d.duration,
    lineWidth: d => d.width,
    cursor: (d, i) => i % 2 ? 'pointer' : null,
  }
}
function getSampleTimelineData (n: number): SampleTimelineDatum[] {
  return sampleTimelineData(n)
  .map((d, i) => ({
    type: `${i % 25}`, // Records of the same type are plotted in one row
    ...d,
  }))
}

@Component({
  selector: 'timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
})

export class TimelineComponent implements AfterViewInit {
  title = 'timeline'
  component = Timeline

  configGenerator = getTimelineConfig
  dataGenerator = getSampleTimelineData

  axesGenerator = () => ({
    x: new Axis<SampleTimelineDatum>({
      x: d => d.time,
      tickTextWidth: 80,
      tickFormat: t => (new Date(t)).toLocaleString()
    }),
  })

  ngAfterViewInit (): void {
  }
}


