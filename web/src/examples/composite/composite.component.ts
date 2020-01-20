// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core'
// Vis
import {XYContainer, XYContainerConfigInterface} from '@volterra/vis/containers'
import {Axis, Brush, Line, LineConfigInterface, StackedBar, StackedBarConfigInterface, Tooltip } from '@volterra/vis/components'
// Helpers
import _times from 'lodash/times'

function generateData (): object[] {
  return _times(200).map((i) => ({
    x: i,
    y: Math.random(),
    y1: Math.random(),
    y2: Math.random(),
    y3: Math.random(),
    y4: Math.random(),
  }))
}

@Component({
  selector: 'composite',
  templateUrl: './composite.component.html',
  styleUrls: ['./composite.component.css'],
})

export class CompositeComponent implements AfterViewInit {
  title = 'composite'
  yAccessors = [
    d => d.y,
    d => d.y1,
    d => d.y2,
    d => d.y3,
    d => d.y4,
  ]
  legendItems: { name: string, inactive?: boolean }[] = this.yAccessors.map((d, i) => ({ name: `Stream ${i + 1}` }))
  chartConfig: XYContainerConfigInterface
  barConfig: StackedBarConfigInterface
  lineConfig: LineConfigInterface
  composite: XYContainer
  @ViewChild('chart', { static: false }) chart: ElementRef
  @ViewChild('navigation', { static: false }) navigation: ElementRef
  @ViewChild('legendRef', { static: false }) legendRef: ElementRef


  ngAfterViewInit (): void {
    const data = generateData()
    this.barConfig = getBarConfig(this.yAccessors)
    this.lineConfig = getLineConfig(this.yAccessors)
    
    this.chartConfig = {
      margin: { top: 10, bottom: 10, left: 10, right: 10 },
      components: [
        new StackedBar(this.barConfig),
      ],
      dimensions: {
        x: {
          domain: undefined
        }
      },
      axes: {
        x: new Axis({
          label: 'x axis',
        }),
        y: new Axis({
          label: 'y axis',
        }),
      },
      tooltip: new Tooltip({
        triggers: {
          [StackedBar.selectors.bar]: (d) => '<span>Bar Chart</span>',
        },
      }),
    }

    this.composite = new XYContainer(this.chart.nativeElement, this.chartConfig, data)

    const navConfig = {
      margin: { left: 9, right: 9 },
      components: [
        new StackedBar(this.lineConfig),
        new Brush({
          onBrush: (s) => {
            this.chartConfig.dimensions.x.domain = s
            this.composite.updateContainer(this.chartConfig, true)
            this.composite.render(0)
          },
        }),
      ],
      dimensions: {
      },
      axes: {
        x: new Axis(),
      }
    }

    // @ts-ignore
    const nav = new XYContainer(this.navigation.nativeElement, navConfig, data)
  }

  onLegendItemClick (event): void {
    const { d } = event
    d.inactive = !d.inactive
    this.legendItems = [ ...this.legendItems ]
    const accessors = this.yAccessors.map((acc, i) => !this.legendItems[i].inactive ? acc : null)
    this.barConfig.y = accessors
    this.composite.updateComponents([this.barConfig])
  }
}

function getBarConfig (y): StackedBarConfigInterface {
  return {
    x: d => d.x,
    y,
    barMaxWidth: 15,
    roundedCorners: false,
    events: {
      [StackedBar.selectors.bar]: {
        click: d => { },
      },
    },
  }
}

function getLineConfig (y) {
  return {
    barMaxWidth: 15,
    x: d => d.x,
    y,
    events: {
      [Line.selectors.line]: {
        click: d => { },
      },
    },
  }
}
