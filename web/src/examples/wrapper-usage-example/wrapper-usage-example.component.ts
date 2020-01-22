// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { AfterViewInit, Component } from '@angular/core'

// Vis
import { Axis, StackedBar, Tooltip } from '@volterra/vis/components'

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
  data: SampleDatum[] = sampleSeriesData(100)

  // Chart configuration
  stackedBarConfig = {
    x: d => d.x,
    y: [
      d => d.y,
      d => d.y1,
    ],
    barMaxWidth: 8,
    roundedCorners: true,
    events: {
      [StackedBar.selectors.bar]: {
        click: d => { },
      },
    },
  }
  stackedBar = new StackedBar<SampleDatum>(this.stackedBarConfig)

  components = [this.stackedBar]

  margin = { top: 10, bottom: 10, left: 10, right: 10 }

  dimensions: {}

  axes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  tooltip = new Tooltip({
    triggers: {
      [StackedBar.selectors.bar]: (d) => `<span>Bar Chart</span>`,
    },
  })

  ngAfterViewInit (): void {

    setInterval(() => {
      // this.margin = { ...this.margin, top: 50 }
      this.data = sampleSeriesData(Math.floor(10 + 150*Math.random()))
      this.stackedBarConfig.barMaxWidth = Math.random() * 20
      this.stackedBarConfig = { ...this.stackedBarConfig } // Updating the object to trigger change detection
    }, 5000)
  }

}


