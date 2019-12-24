// Copyright (c) Volterra, Inc. All rights reserved.

import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'
import _times from 'lodash/times'
import { components, containers, Scales } from '@volterra/vis'

const { CompositeChart } = containers
const { Line, StackedBar, Tooltip, Brush } = components

function generateData (): object[] {
  return _times(300).map((i) => ({
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
    // this.chart = new CompositeChart(chartElement, this.config, this.data)

    const barConfig = getBarConfig()
    const lineConfig = getLineConfig()
    const chartConfig = {
      components: [
        new StackedBar(barConfig),
        new Line(lineConfig),
      ],
      dimensions: {
        x: { scale: Scales.scaleLinear() },
        y: { scale: Scales.scaleLinear() },
        size: { scale: Scales.scaleLinear() },
      },
      // tooltip: new Tooltip({
      //   elements: {
      //     [StackedBar.selectors.bar]: (d) => '<span>Bar Chart</span>',
      //   },
      // }),
    }
    const data = generateData()
    const composite = new CompositeChart(this.chart.nativeElement, chartConfig, data)

    const navConfig = {
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
        x: { scale: Scales.scaleLinear() },
        y: { scale: Scales.scaleLinear() },
      },
    }

    const nav = new CompositeChart(this.navigation.nativeElement, navConfig, data)
  }

  ngOnInit (): void {
    this.data = []
    this.config = {}
  }
}

function getBarConfig () {
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
    x: d => d.x,
    y: d => d.y,
    events: {
      [Line.selectors.line]: {
        click: d => { },
      },
    },
  }
}
