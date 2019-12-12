// Copyright (c) Volterra, Inc. All rights reserved.

import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'
import _times from 'lodash/times'
import { components, containers, Scale } from '@volterra/vis'

const { SingleChart } = containers
const { Line, Tooltip } = components

function generateData (): object[] {
  return _times(20).map((i) => ({
    x: i,
    y: Math.random(),
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
      color: '#f00',
      x: d => d.x,
      y: d => d.y,
      events: {
        [Line.selectors.line]: {
          'click' : d => { console.log('event', d)},
        }
      },
    }
    const component = new Line(lineComponentConfig)

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
          [Line.selectors.line]: (d) => `<span>Line Chart</span>`
        }
      })
    }

    const singleChart = new SingleChart(chartElement, singleChartConfig, this.data)
    // singleChart.render()

    setInterval(() => {
      lineComponentConfig.color = '#00f'
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
