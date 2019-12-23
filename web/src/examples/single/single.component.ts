// Copyright (c) Volterra, Inc. All rights reserved.

import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'
import _times from 'lodash/times'
import _sample from 'lodash/sample'
import { components, containers, Scales } from '@volterra/vis'

const { SingleChart } = containers
const { Line, StackedBar, Scatter, Tooltip } = components

function generateData (): object[] {
  return _times(30).map((i) => ({
    x: i,
    y: Math.random(),
    y1: Math.random(),
    y2: Math.random(),
    y3: Math.random(),
    y4: Math.random(),
    size: Math.random() * (500 - 300) + 300,
    shape: Math.random() > 0.8 ? 'circle' : _sample(['cross', 'diamond', 'square', 'star', 'triangle', 'wye']),
    icon: Math.random() > 0.8 ? '☁' : undefined,
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
  @ViewChild('scatterchart', { static: false }) scatterChart: ElementRef

  ngAfterViewInit (): void {
    const barConfig = getBarConfig()
    const barChartConfig = {
      component: new StackedBar(barConfig),
      dimensions: {
        x: { scale: Scales.scaleLinear() },
        y: { scale: Scales.scaleLinear() },
        size: { scale: Scales.scaleLinear() },
      },
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
      // dimensions: {
      //   x: { scale: Scales.scaleLinear() },
      //   y: { scale: Scales.scaleLinear() },
      //   size: { scale: Scales.scaleLinear() },
      // },
      tooltip: new Tooltip({
        elements: {
          [Line.selectors.line]: (d) => '<span>Line Chart</span>',
        },
      }),
    }
    const lineChart = new SingleChart(this.lineChart.nativeElement, lineChartConfig, this.data)

    const scatterConfig = getScatterConfig()
    const scatterChartConfig = {
      component: new Scatter(scatterConfig),
      dimensions: {
        x: { scale: Scales.scaleLinear() },
        y: { scale: Scales.scaleLinear() },
        size: { scale: Scales.scaleLinear() },
      },
      tooltip: new Tooltip({
        elements: {
          [Scatter.selectors.point]: (d) => '<span>Scatter Chart</span>',
        },
      }),
    }

    const scatterChart = new SingleChart(this.scatterChart.nativeElement, scatterChartConfig, this.data)

    setInterval(() => {
    // lineComponentConfig.color = '#00f'
      barChart.setData(generateData(), true)
      barChart.updateComponent(barConfig)
      lineChart.setData(generateData())
      scatterChart.setData(generateData())
    }, 10000)
  }

  ngOnInit (): void {
    this.data = generateData()
  }
}

function getScatterConfig () {
  return {
    x: d => d.x,
    y: d => d.y,
    size: d => d.size,
    shape: d => d.shape,
    icon: d => d.icon,
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
