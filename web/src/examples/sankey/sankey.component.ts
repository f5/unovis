// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'

// Vis
import { SingleChart, Sankey, SankeyConfigInterface } from '@volterra/vis'

import sankeyData from './data/test.json'


interface SankeyNodeDatum {
  id: string,
  type: string,
  label: string,
  labelLength: number,
  labelTrim: string,
}

interface SankeyLinkDatum {
  source: string,
  target: string,
  flow: number,
}

@Component({
  selector: 'sankey',
  templateUrl: './sankey.component.html',
  styleUrls: ['./sankey.component.css'],
})

export class SankeyComponent implements OnInit, AfterViewInit {
  title = 'sankey'
  chart: any
  data: any
  config: any
  legendItems: string[] = ['port', 'ip', 'vn', 'vn', 'ip', 'port']
  legendMargin: { left?: number; right?: number } = {}
  singleChartConfig: any
  @ViewChild('sankeychart', { static: false }) sankeyChart: ElementRef

  ngAfterViewInit (): void {
    const sankeyConfig: SankeyConfigInterface<SankeyNodeDatum, SankeyLinkDatum> = getSankeyConfig()
    this.singleChartConfig = {
      component: new Sankey(sankeyConfig),
    }
    new SingleChart(this.sankeyChart.nativeElement, this.singleChartConfig, this.data)
    this.legendMargin = this.getLegendMargin()
  }

  ngOnInit (): void {
    this.data = sankeyData
  }

  getLegendMargin () : { left: number; right: number } {
    const sankeyBleed = this.singleChartConfig?.component.bleed
    return {
      left: sankeyBleed?.left || 0,
      right: sankeyBleed?.right || 0,
    }
  }
}

function getSankeyConfig () {
  return {
    nodeLabel: d => d.label,
    linkValue: d => d.flow,
  }
}
