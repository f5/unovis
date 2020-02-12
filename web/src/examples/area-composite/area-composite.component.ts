// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core'
// Vis
import {XYContainer, XYContainerConfigInterface} from '@volterra/vis/containers'
import {
  Axis,
  Area,
  AreaConfigInterface,
  Tooltip,
} from '@volterra/vis/components'

import { CurveType } from '@volterra/vis/types'

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
  selector: 'area-composite',
  templateUrl: './area-composite.component.html',
  styleUrls: ['./area-composite.component.css'],
})

export class AreaCompositeComponent implements AfterViewInit {
  title = 'area-composite'
  yAccessors = [
    d => d.y,
    d => d.y1,
    d => d.y2,
    d => d.y3,
  ]
  legendItems: { name: string, inactive?: boolean }[] = this.yAccessors.map((d, i) => ({ name: `Stream ${i + 1}` }))
  chartConfig: XYContainerConfigInterface<AreaSampleDatum>
  areaConfig: AreaConfigInterface<AreaSampleDatum>
  composite: XYContainer<AreaSampleDatum>
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
    }

    this.composite = new XYContainer(this.chart.nativeElement, this.chartConfig, data)

    setInterval(() => {
      this.composite.setData(generateData())
    }, 5000)
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
    curveType: CurveType.Basis,
  }
}

