// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { AfterViewInit, Component } from '@angular/core'

// Vis
import { Axis, Timeline, Tooltip } from '@volterra/vis/components'

// Helpers
import { sampleTimelineData, SampleTimelineDatum } from '../../utils/data'

@Component({
  selector: 'timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
})

export class TimelineComponent implements AfterViewInit {
  title = 'timeline'

  // Data
  data: SampleTimelineDatum[] = sampleTimelineData(50)
    .map((d, i) => ({
      type: `${i % 25}`, // Records of the same type are plotted in one row
      ...d,
    }))

  // Chart configuration
  timelineConfig = {
    x: d => d.time,
    length: d => d.duration,
    lineWidth: d => d.width,
  }
  timeline = new Timeline<SampleTimelineDatum>(this.timelineConfig)

  components = [this.timeline]

  margin = { top: 10, bottom: 10, left: 10, right: 10 }
  padding = { top: 0, left: 0, right: 0, bottom: 5 }

  dimensions: {}

  axes = {
    x: new Axis<SampleTimelineDatum>({
      x: d => d.time,
      tickTextWidth: 80,
      tickFormat: t => (new Date(t)).toLocaleString()
    }),
  }

  tooltip = new Tooltip({
    triggers: {
      [Timeline.selectors.line]: (d) => `<span>Line</span>`,
    },
  })

  ngAfterViewInit (): void {
    setInterval(() => {
      // this.margin = { ...this.margin, top: 50 }
      this.data = sampleTimelineData(Math.floor(10 + 100*Math.random()))
      this.timelineConfig = { ...this.timelineConfig } // Updating the object to trigger change detection
    }, 5000)
  }

}


