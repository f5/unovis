// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { AfterViewInit, Component } from '@angular/core'

// Vis
import { Axis, GroupedBar, Tooltip, Crosshair } from '@volterra/vis'

// Helpers
import { sampleSeriesData, SampleDatum } from '../../utils/data'

@Component({
  selector: 'wrapper-usage-example',
  templateUrl: './wrapper-usage-example.component.html',
  styleUrls: ['./wrapper-usage-example.component.css'],
})

export class WrapperUsageExampleComponent implements AfterViewInit {
  title = 'wrapper-usage-example'

  // Data
  data: SampleDatum[] = sampleSeriesData(25)

  // Chart configuration
  groupedBarConfig = {
    x: d => d.x,
    y: [
      d => d.y,
      d => d.y1,
    ],
    id: d => d.index,
    barMaxWidth: 8,
    roundedCorners: 2,
    events: {
      [GroupedBar.selectors.bar]: {
        click: d => { },
      },
    },
  }
  groupedBar = new GroupedBar<SampleDatum>(this.groupedBarConfig)

  components = [this.groupedBar]

  margin = { top: 10, bottom: 10, left: 10, right: 10 }

  dimensions: {}

  axes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  tooltip = new Tooltip({
    triggers: {
      [GroupedBar.selectors.bar]: (d) => {console.log(d)},
    },
  })

  crosshair = new Crosshair<SampleDatum>({
    template: (d) => `
      <div>X: ${d.x}</div>
      <div>Value 1: ${d.y.toFixed(2)}</div>
      <div>Value 2: ${d.y1.toFixed(2)}</div>
    `,
  })

  ngAfterViewInit (): void {

    setInterval(() => {
      // this.margin = { ...this.margin, top: 50 }
      this.data = sampleSeriesData(Math.floor(10 + 150*Math.random()))
      this.groupedBarConfig.barMaxWidth = Math.random() * 20
      this.groupedBarConfig = { ...this.groupedBarConfig } // Updating the object to trigger change detection
    }, 5000)
  }

}


