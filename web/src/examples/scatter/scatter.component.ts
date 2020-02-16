// Copyright (c) Volterra, Inc. All rights reserved.
import { AfterViewInit, Component } from '@angular/core'

// Vis
import { Axis, Tooltip, Scatter, ScatterConfigInterface } from '@volterra/vis/components'
import { SymbolType } from '@volterra/vis/types'

// Helpers
import { SampleScatterDatum, sampleScatterData } from '../../utils/data'

function getScatterConfig (): ScatterConfigInterface<SampleScatterDatum> {
  return {
    x: (d): number => d.x,
    y: (d): number => d.y,
    size: (d): number => d.size,
    shape: (d): SymbolType => d.shape,
    icon: (d): any => d.icon,
  }
}

@Component({
  selector: 'scatter',
  templateUrl: './scatter.component.html',
  styleUrls: ['./scatter.component.css'],
})

export class ScatterComponent implements AfterViewInit {
  title = 'scatter'
  margin = { top: 10, bottom: 10, left: 10, right: 10 }
  dimensions: {}
  config = getScatterConfig()

  zeroData: SampleScatterDatum[] = sampleScatterData(0)
  zeroDataScatter = new Scatter(this.config)
  zeroDataComponents = [this.zeroDataScatter]
  zeroAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  singleData: SampleScatterDatum[] = sampleScatterData(1)
  singleDataScatter = new Scatter(this.config)
  singleDataComponents = [this.singleDataScatter]
  singleAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  dynamicData: SampleScatterDatum[] = sampleScatterData(20)
  dynamicDataScatter = new Scatter(this.config)
  dynamicDataComponents = [this.dynamicDataScatter]
  dynamicAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  manyData: SampleScatterDatum[] = sampleScatterData(500, 5, 10)
  manyDataScatter = new Scatter(this.config)
  manyDataComponents = [this.manyDataScatter]
  manyDataAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  fewData: SampleScatterDatum[] = sampleScatterData(50, 10, 20)
  fewDataScatter = new Scatter(this.config)
  fewDataComponents = [this.fewDataScatter]
  fewAxes = {
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  }

  tooltip = new Tooltip({
    triggers: {
      [Scatter.selectors.point]: (): string => '<span>Scatter point</span>',
    },
  })

  ngAfterViewInit (): void {
    setInterval(() => {
      this.dynamicData = sampleScatterData(this.dynamicData.length ? 0 : 30)
    }, 2000)
  }
}
