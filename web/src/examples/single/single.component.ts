// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'

// Vis
import { SymbolType } from '@volterra/vis/types'
import {SingleChart, SingleChartConfigInterface} from '@volterra/vis/containers'
import {Line, StackedBar, Scatter, Tooltip, StackedBarConfigInterface} from '@volterra/vis/components'
import { Scale } from '@volterra/vis/types'

// Helpers
import _times from 'lodash/times'
import _sample from 'lodash/sample'

interface SampleData {
  x: number,
  y: number,
  y1: number,
  y2: number,
  y3: number,
  y4: number,
  size: number,
  shape: SymbolType,
  icon: any
}
function generateData (): SampleData[] {
  return _times(30).map((i) => ({
    x: i,
    y: Math.random(),
    y1: Math.random(),
    y2: Math.random(),
    y3: Math.random(),
    y4: Math.random(),
    size: 50,// Math.random() * (30) + 10,
    shape: Math.random() > 0.8 ? SymbolType.CIRCLE : _sample([SymbolType.CROSS, SymbolType.DIAMOND, SymbolType.SQUARE, SymbolType.STAR, SymbolType.TRIANGLE, SymbolType.WYE]),
    icon: Math.random() > 0.8 ? '☁️' : undefined,
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
  data: SampleData[]
  config: any
  @ViewChild('linechart', { static: false }) lineChart: ElementRef
  @ViewChild('barchart', { static: false }) barChart: ElementRef
  @ViewChild('scatterchart', { static: false }) scatterChart: ElementRef

  ngAfterViewInit (): void {
    const barConfig = getBarConfig()
    const barChartConfig: SingleChartConfigInterface<SampleData> = {
      component: new StackedBar(barConfig),
      dimensions: {
        x: { scale: Scale.scaleLinear() },
        y: { scale: Scale.scaleLinear() },
        size: { scale: Scale.scaleLinear() },
      },
      tooltip: new Tooltip({
        triggers: {
          [StackedBar.selectors.bar]: (d) => '<span>Bar Chart</span>',
        },
      }),
    }
    const barChart = new SingleChart(this.barChart.nativeElement, barChartConfig, this.data)

    const lineConfig = getLineConfig()
    const lineChartConfig: SingleChartConfigInterface<SampleData> = {
      component: new Line(lineConfig),
      // dimensions: {
      //   x: { scale: Scale.scaleLinear() },
      //   y: { scale: Scale.scaleLinear() },
      //   size: { scale: Scale.scaleLinear() },
      // },
      tooltip: new Tooltip({
        triggers: {
          [Line.selectors.line]: (d) => '<span>Line Chart</span>',
        },
      }),
    }
    const lineChart = new SingleChart(this.lineChart.nativeElement, lineChartConfig, this.data)

    const scatterConfig = getScatterConfig()
    const scatterChartConfig: SingleChartConfigInterface<SampleData> = {
      component: new Scatter(scatterConfig),
      dimensions: {
        x: { scale: Scale.scaleLinear() },
        y: { scale: Scale.scaleLinear() },
        size: { scale: Scale.scaleLinear() },
      },
      tooltip: new Tooltip({
        triggers: {
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

function getBarConfig (): StackedBarConfigInterface<SampleData> {
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
