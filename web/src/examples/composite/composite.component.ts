// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core'
// Vis
import {XYContainer, XYContainerConfigInterface} from '@volterra/vis/containers'
import {Axis, Brush, Line, StackedBar, StackedBarConfigInterface, Tooltip} from '@volterra/vis/components'
// Helpers
import _times from 'lodash/times'

function generateData (): object[] {
  return _times(30).map((i) => ({
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

export class CompositeComponent implements OnInit, AfterViewInit {
  title = 'composite'
  data: any
  config: any
  @ViewChild('chart', { static: false }) chart: ElementRef
  @ViewChild('navigation', { static: false }) navigation: ElementRef

  ngAfterViewInit (): void {
    // const chartElement = this.chartRef.nativeElement
    // this.chart = new XYContainer(chartElement, this.config, this.data)

    const barConfig = getBarConfig()
    const lineConfig = getLineConfig()
    const chartConfig: XYContainerConfigInterface = {
      margin: { top: 10, bottom: 10, left: 10, right: 10 },
      // padding: { left: 10, right: 10 },
      components: [
        new StackedBar(barConfig),
        new Line(lineConfig),
      ],
      dimensions: {
        x: {
          domain: undefined
        }
      },
      axes: {
        x: new Axis({
          // position: 'top',
          label: 'x axis',
        }),
        y: new Axis({
          // position: 'right',
          label: 'y axis',
        }),
      },
      tooltip: new Tooltip({
        triggers: {
          [StackedBar.selectors.bar]: (d) => '<span>Bar Chart</span>',
        },
      }),
    }
    const data = generateData()
    const composite = new XYContainer(this.chart.nativeElement, chartConfig, data)

    const navConfig = {
      margin: { left: 9, right: 9 },
      components: [
        new StackedBar(lineConfig),
        new Brush({
          onBrush: (s) => {
            chartConfig.dimensions.x.domain = s
            composite.updateContainer(chartConfig, true)
            composite.render(0)
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

  ngOnInit (): void {
    this.data = []
    this.config = {}
  }
}

function getBarConfig (): StackedBarConfigInterface {
  return {
    x: d => d.x,
    y: [
      d => d.y,
      d => d.y1,
      d => d.y2,
      d => d.y3,
      d => d.y4,
    ],
    barMaxWidth: 15,
    roundedCorners: false,
    events: {
      [StackedBar.selectors.bar]: {
        click: d => { },
      },
    },
  }
}

function getLineConfig () {
  return {
    barMaxWidth: 15,
    x: d => d.x,
    y: [
      d => d.y,
      d => d.y1,
      d => d.y2,
      d => d.y3,
      d => d.y4,
    ],
    events: {
      [Line.selectors.line]: {
        click: d => { },
      },
    },
  }
}
