// Copyright (c) Volterra, Inc. All rights reserved.

import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'
import _times from 'lodash/times'
import { components, containers, Scale } from '@volterra/vis'

const { SingleChart } = containers
const { Line, StackedBar, Tooltip } = components

function generateData (): object[] {
  return _times(100).map((i) => ({
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
  @ViewChild('chart', { static: false }) chartView: ElementRef

  ngAfterViewInit (): void {
    const chartElement = this.chartView.nativeElement

    const lineComponentConfig = {
      // color: '#f00',
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
          click: d => { console.log('event', d) },
        },
      },
    }
    const component = new StackedBar(lineComponentConfig)

    const singleChartConfig = {
      component,
      x: {
        scale: Scale.scaleLinear(),
        // domain: [0, 100],
      },
      y: {
        scale: Scale.scaleLinear(),
        // domain: [0, 100],
      },
      tooltip: new Tooltip({
        elements: {
          [StackedBar.selectors.bar]: (d) => '<span>Line Chart</span>',
        },
      }),
    }

    const singleChart = new SingleChart(chartElement, singleChartConfig, this.data)
    // singleChart.render()

    setInterval(() => {
      // lineComponentConfig.color = '#00f'
      singleChart.setData(generateData(), true)
      singleChart.updateComponent(lineComponentConfig)
    }, 3000)
    // const tooltip = new Tooltip(singleChart, config)

    // singleChart.setData(data)
    // singleChart.setConfig(config)
  }

  ngOnInit (): void {
    this.data = generateData()
  }
}
