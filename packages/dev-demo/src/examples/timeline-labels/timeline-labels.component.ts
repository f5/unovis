// Copyright (c) Volterra, Inc. All rights reserved.
import { Component } from '@angular/core'
import { CrosshairCircle, PositionStrategy } from '@volterra/vis'

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
  dataStartTime = Date.now()
  dataDuration = 1000 * 60 * 60 * 24 * 15
  data: SampleTimelineDatum[] = [
    { type: 'US East (N VA)', time: this.dataStartTime, duration: this.dataDuration / 3, color: this.colorHealthy },
    { type: 'US East (N VA)', time: this.dataStartTime + this.dataDuration * 2 / 3, duration: this.dataDuration / 3, color: this.colorHealthy },
    { type: 'US East (N VA)', time: this.dataStartTime + this.dataDuration / 3, duration: this.dataDuration / 3, color: this.colorCritical },

    { type: 'Africa (Cape Town)', time: this.dataStartTime, duration: this.dataDuration / 2, color: this.colorHealthy },
    { type: 'Africa (Cape Town)', time: this.dataStartTime + this.dataDuration * 3 / 4, duration: this.dataDuration / 4, color: this.colorHealthy },
    { type: 'Africa (Cape Town)', time: this.dataStartTime + this.dataDuration / 2, duration: this.dataDuration / 4, color: this.colorCritical },

    { type: 'Europe (Amsterdam)', time: this.dataStartTime, duration: this.dataDuration, color: this.colorHealthy },

    { type: 'Asia Pacific (Tokyo)', time: this.dataStartTime, duration: this.dataDuration, color: this.colorHealthy },
  ]

  dataLabels = Array.from(new Set(this.data.map(d => d.type)))

  dataGlobal: SampleTimelineDatum[] = [
    { type: 'Global', time: Date.now(), duration: this.dataDuration, color: this.colorHealthy },
  ]

  crosshairTemplate = (d: SampleTimelineDatum, x: number): string => {
    const records = this.findDataEntriesAt(x)
    return `
<div class="timeline-tooltip">
    ${new Date(x).toUTCString()}
    ${records.map(d =>
    `<div><span style="background-color: ${d.color}"></span>${d.type}</div>`
  ).join('')}
</div>`
  }

  numRows = (new Set(this.data.map(d => d.type))).size
  margin = { top: 0, bottom: 0, left: 0, right: 0 }
  formatXTicks = (timestamp: number): string => (new Date(timestamp)).toLocaleDateString()
  x = (d: SampleTimelineDatum): number => d.time
  length = (d: SampleTimelineDatum): number => d.duration
  type = (d: SampleTimelineDatum): string => d.type

  tooltipContainer = document.body
  tooltipPositionStrategy = PositionStrategy.Fixed

  getCircles = (x: number, data: SampleTimelineDatum[]): CrosshairCircle[] =>
    this.findDataEntriesAt(x).map((d, i) => ({
      y: 11 + i * 22,
      color: d.color,
    }))

  findDataEntriesAt (x: number): SampleTimelineDatum[] {
    return this.data.filter(d => (d.time < x) && ((d.time + d.duration) >= x))
  }
}
