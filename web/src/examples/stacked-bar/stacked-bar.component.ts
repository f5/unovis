// Copyright (c) Volterra, Inc. All rights reserved.
import { AfterViewInit, Component } from '@angular/core'

// Vis
import { StackedBar, StackedBarConfigInterface } from '@volterra/vis/components'

// Helpers
import { SampleDatum, sampleSeriesData } from '../../utils/data'

function getStackedBarConfig (): StackedBarConfigInterface<SampleDatum> {
  return {
    x: d => d.x,
    y: [
      d => d.y,
      d => d.y1,
      d => d.y2,
    ],
    roundedCorners: true,
  }
}

@Component({
  selector: 'stacked-bar',
  templateUrl: './stacked-bar.component.html',
  styleUrls: ['./stacked-bar.component.css'],
})

export class StackedBarComponent implements AfterViewInit {
  title = 'stacked-bar'
  component = StackedBar

  configGenerator = getStackedBarConfig
  dataGenerator = sampleSeriesData

  ngAfterViewInit (): void { }
}
