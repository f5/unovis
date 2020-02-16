// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'

// Vis
import { SingleChart, Sankey, SankeyConfigInterface } from '@volterra/vis'

import sankeyData from './data/test.json'
import sankeyManyData from './data/many.json'
import sankeySingleData from './data/single.json'
import sankeyZeroData from './data/zero.json'
import sankeyFewData from './data/few.json'

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
  @ViewChild('sankeymany', { static: false }) sankeyManyChart: ElementRef
  @ViewChild('sankeyfew', { static: false }) sankeyFewChart: ElementRef
  @ViewChild('sankeydynamic', { static: false }) sankeyDynamicChart: ElementRef
  @ViewChild('sankeysingle', { static: false }) sankeySingleChart: ElementRef
  @ViewChild('sankeyzero', { static: false }) sankeyZeroChart: ElementRef

  ngAfterViewInit (): void {
    const sankeyConfig: SankeyConfigInterface<SankeyNodeDatum, SankeyLinkDatum> = getSankeyConfig()
    this.singleChartConfig = {
      component: new Sankey(sankeyConfig),
    }
    new SingleChart(this.sankeyManyChart.nativeElement, this.singleChartConfig, sankeyManyData)
    new SingleChart(this.sankeyFewChart.nativeElement, { component: new Sankey(sankeyConfig) }, sankeyFewData)
    const dynamicChart = new SingleChart(this.sankeyDynamicChart.nativeElement, { component: new Sankey(sankeyConfig) }, sankeyFewData)
    new SingleChart(this.sankeySingleChart.nativeElement, { component: new Sankey(sankeyConfig) }, sankeySingleData)
    new SingleChart(this.sankeyZeroChart.nativeElement, { component: new Sankey(sankeyConfig) }, sankeyZeroData)
    this.legendMargin = this.getLegendMargin()

    setInterval(() => {
      this.data = this.data.nodes.length ? sankeyZeroData : sankeyFewData      
      dynamicChart.setData(this.data)
    }, 2000)
  }

  ngOnInit (): void {
    this.data = sankeyFewData
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
