// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import {AfterViewInit, OnDestroy, Component, ElementRef, ViewChild} from '@angular/core'
// Vis
import {
  XYContainer,
  XYContainerConfigInterface,
  Axis,
  Area,
  AreaConfigInterface,
  Tooltip,
  Crosshair,
} from '@volterra/vis'

// Helpers
import { SampleDatum } from '../../utils/data'

import _times from 'lodash/times'
import _random from 'lodash/random'

interface AreaSampleDatum extends SampleDatum {
  baseline: number
}

function generateData (): AreaSampleDatum[] {
  return _times(30).map((i) => ({
    x: i,
    y: _random(0, 100),
    y1: _random(0, 100),
    y2: _random(0, 100),
    y3: _random(0, 100),
    baseline: _random(30, 80),
  }))
}

@Component({
  selector: 'bullet-legend',
  templateUrl: './bullet-legend.component.html',
  styleUrls: ['./bullet-legend.component.css'],
})

export class BulletLegendExampleComponent implements AfterViewInit, OnDestroy {
  title = 'bullet-legend'
  yAccessors = [
    d => d.y,
    undefined,
    d => d.y2,
    d => d.y3,
  ]
  legendItems: { name: string, inactive?: boolean }[] = this.yAccessors.map((d, i) => ({ name: `Stream ${i + 1}`, hidden: !d }))
  chartConfig: XYContainerConfigInterface<AreaSampleDatum>
  areaConfig: AreaConfigInterface<AreaSampleDatum>
  composite: XYContainer<AreaSampleDatum>
  intervalId: NodeJS.Timeout
  @ViewChild('chart', { static: false }) chart: ElementRef
  @ViewChild('legendRef', { static: false }) legendRef: ElementRef


  ngAfterViewInit (): void {
    const data: AreaSampleDatum[] = generateData()
    this.areaConfig = getAreaConfig(this.yAccessors)

    this.chartConfig = {
      margin: { top: 10, bottom: 10, left: 15, right: 10 },
      components: [
        new Area(this.areaConfig),
      ],
      dimensions: {
        x: {
          domain: undefined
        }
      },
      axes: {
        x: new Axis({
          label: 'Index',
        }),
        y: new Axis({
        }),
      },
      tooltip: new Tooltip({
        triggers: {
          [Area.selectors.area]: (d) => '<span>Area</span>',
        },
      }),
      crosshair: new Crosshair({
        template: (d) => `<span>Index: ${d.x}</span>`,
      }),
    }

    this.composite = new XYContainer(this.chart.nativeElement, this.chartConfig, data)

    this.intervalId = setInterval(() => {
      this.composite.setData(generateData())
    }, 5000)
  }

  ngOnDestroy () : void {
    clearInterval(this.intervalId)
  }

  onLegendItemClick (event): void {
    const { d } = event
    d.inactive = !d.inactive
    this.legendItems = [ ...this.legendItems ]
    const accessors = this.yAccessors.map((acc, i) => !this.legendItems[i].inactive ? acc : null)
    this.areaConfig.y = accessors
    this.composite.updateComponents([this.areaConfig])
  }
}

function getAreaConfig (y): AreaConfigInterface<AreaSampleDatum> {  
  return {
    x: d => d.x,
    y,
    baseline: d => d.baseline,
  }
}

