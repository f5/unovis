// Copyright (c) Volterra, Inc. All rights reserved.
import { AfterViewInit, Component } from '@angular/core'

// Vis
import { Axis, Tooltip, StackedBar, StackedBarConfigInterface } from '@volterra/vis/components'

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
  margin = { top: 10, bottom: 10, left: 10, right: 10 }
  dimensions: {}
  config = getStackedBarConfig()

  zeroData: SampleDatum[] = sampleSeriesData(0)
  zeroDataStacked = new StackedBar(this.config)
  zeroDataComponents = [this.zeroDataStacked]
  zeroDataAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  singleData: SampleDatum[] = sampleSeriesData(1)
  singleDataStacked = new StackedBar(this.config)
  singleDataComponents = [this.singleDataStacked]
  singleDataAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  dynamicData: SampleDatum[] = sampleSeriesData(20)
  dynamicDataStacked = new StackedBar(this.config)
  dynamicDataComponents = [this.dynamicDataStacked]
  dynamicDataAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  manyData: SampleDatum[] = sampleSeriesData(500)
  manyDataStacked = new StackedBar(this.config)
  manyDataComponents = [this.manyDataStacked]
  manyDataAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  fewData: SampleDatum[] = sampleSeriesData(50)
  fewDataStacked = new StackedBar(this.config)
  fewDataComponents = [this.fewDataStacked]
  fewDataAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  tooltip = new Tooltip({
    triggers: {
      [StackedBar.selectors.bar]: (): string => '<span>Stacked Bar</span>',
    },
  })

  ngAfterViewInit (): void {
    setInterval(() => {
      this.dynamicData = sampleSeriesData(this.dynamicData.length ? 0 : 30)
    }, 2000)
  }
}
