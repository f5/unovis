// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'

// Vis
import { SingleChart } from '@volterra/vis/containers'
import { Sankey, SankeyConfigInterface } from '@volterra/vis/components'

import sankeyData from './data/test.json'

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
  margin: {} = {
    left: 40,
    right: 40,
  }
  sankeyChartConfig: SankeyConfigInterface
  @ViewChild('sankeychart', { static: false }) sankeyChart: ElementRef

  ngAfterViewInit (): void {
    const sankeyConfig = getSankeyConfig()
    this.sankeyChartConfig = {
      margin: this.margin,
      component: new Sankey(sankeyConfig),
    }
    const sankeyChart = new SingleChart(this.sankeyChart.nativeElement, this.sankeyChartConfig, this.data)
  }

  ngOnInit (): void {
    this.data = sankeyData
  }
}

function getSankeyConfig () {
  return {
    accessor: {
      nodeLabel: 'label',
      linkWidth: 'width',
    },
  }
}
