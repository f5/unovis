// Copyright (c) Volterra, Inc. All rights reserved.
import { Component } from '@angular/core'

// Helpers
import { SampleTimelineDatum } from '../../utils/data'

@Component({
  selector: 'timeline-labels',
  templateUrl: './timeline-labels.component.html',
  styleUrls: ['./timeline-labels.component.scss'],
})
export class TimelineLabelsComponent {
  title = 'timeline-labels'

  colorCritical = '#F94D2A'
  colorHealthy = '#37CC67'

  // Data
  data: SampleTimelineDatum[] = [
    { type: 'US East (N VA)', time: Date.now(), duration: 1000 * 60 * 60 * 24 * 15, color: this.colorHealthy },
    { type: 'US East (N VA)', time: Date.now() + 1000 * 60 * 60 * 24 * 5, duration: 1000 * 60 * 60 * 24 * 6, color: this.colorCritical },
    { type: 'US West (N CA)', time: Date.now(), duration: 1000 * 60 * 60 * 24 * 15, color: this.colorHealthy },
    { type: 'Africa (Cape Town)', time: Date.now(), duration: 1000 * 60 * 60 * 24 * 15, color: this.colorHealthy },
    { type: 'Africa (Cape Town)', time: Date.now() + 1000 * 60 * 60 * 24 * 7, duration: 1000 * 60 * 60 * 24 * 2, color: this.colorCritical },
    { type: 'Europe (Amsterdam)', time: Date.now(), duration: 1000 * 60 * 60 * 24 * 15, color: this.colorHealthy },
    { type: 'Asia Pacific (Tokyo)', time: Date.now(), duration: 1000 * 60 * 60 * 24 * 15, color: this.colorHealthy },
    { type: 'Asia Pacific (Seoul)', time: Date.now(), duration: 1000 * 60 * 60 * 24 * 15, color: this.colorHealthy },
  ]

  dataGlobal: SampleTimelineDatum[] = [
    { type: 'Global', time: Date.now(), duration: 1000 * 60 * 60 * 24 * 15, color: this.colorHealthy },
  ]

  numRows = (new Set(this.data.map(d => d.type))).size
  margin = { top: 0, bottom: 0, left: 0, right: 0 }
  formatXTicks = (timestamp: number): string => (new Date(timestamp)).toLocaleDateString()
  x = (d: SampleTimelineDatum): number => d.time
  length = (d: SampleTimelineDatum): number => d.duration
  type = (d: SampleTimelineDatum): string => d.type
}
