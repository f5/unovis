// Copyright (c) Volterra, Inc. All rights reserved.

import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'
import _times from 'lodash/times'
import { components, containers, Scale } from '@volterra/vis'

const { SingleChart } = containers
const { Line, StackedBar, Tooltip } = components

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
  selector: 'single',
  templateUrl: './single.component.html',
  styleUrls: ['./single.component.css'],
})

export class SingleComponent implements OnInit, AfterViewInit {
  title = 'single'
  chart: any
  data: any
  config: any
  @ViewChild('linechart', { static: false }) lineChart: ElementRef
  @ViewChild('barchart', { static: false }) barChart: ElementRef

  ngAfterViewInit (): void {
    const barConfig = getBarConfig()
    const barChartConfig = {
      component: new StackedBar(barConfig),
      x: { scale: Scale.scaleLinear() },
      y: { scale: Scale.scaleLinear() },
      tooltip: new Tooltip({
        elements: {
          [StackedBar.selectors.bar]: (d) => '<span>Bar Chart</span>',
        },
      }),
    }
    const barChart = new SingleChart(this.barChart.nativeElement, barChartConfig, this.data)

    const lineConfig = getLineConfig()
    const lineChartConfig = {
      component: new Line(lineConfig),
      x: { scale: Scale.scaleLinear() },
      y: { scale: Scale.scaleLinear() },
      tooltip: new Tooltip({
        elements: {
          [Line.selectors.line]: (d) => '<span>Line Chart</span>',
        },
      }),
    }
    const lineChart = new SingleChart(this.lineChart.nativeElement, lineChartConfig, this.data)

    setInterval(() => {
      // lineComponentConfig.color = '#00f'
      barChart.setData(generateData(), true)
      barChart.updateComponent(barConfig)
      lineChart.setData(generateData())
    }, 10000)
  }

  ngOnInit (): void {
    this.data = generateData()
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
