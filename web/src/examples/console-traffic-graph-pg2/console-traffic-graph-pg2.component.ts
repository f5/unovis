// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'
import _times from 'lodash/times'
import _sample from 'lodash/sample'
import _random from 'lodash/random'

import { Graph, SingleChart, GraphConfigInterface } from '@volterra/vis'

import { overviewConfig } from './configuration/graph-config'
import consoleData from './data/traffic.json'
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast'

@Component({
  selector: 'console-traffic-graph-pg2',
  templateUrl: './console-traffic-graph-pg2.component.html',
  styleUrls: ['./console-traffic-graph-pg2.component.css'],
})

export class TrafficGraphComponent implements OnInit, AfterViewInit {
  @ViewChild('graph', { static: false }) graph: ElementRef
  title = 'graph'
  chart: any
  overviewData = consoleData
  drilldownData
  layoutType = 'parallel'
  config: GraphConfigInterface<any, any> = overviewConfig(this.overviewData, this.onNodeClick.bind(this))
  panels = this.config.panels

  component = new Graph(this.config)
  
  ngAfterViewInit (): void {
    console.log(this.overviewData)
    this.chart = new SingleChart(this.graph.nativeElement, { component: this.component }, this.overviewData)
  }

  ngOnInit (): void {
  }

  onNodeClick(d): void {
    console.log(d)
  }

  onClick(type) {
    this.layoutType = type
    this.config.layoutType = this.layoutType
    this.config.panels = this.config.layoutType === 'parallel' ? this.panels : [] 
    this.chart.updateComponent(this.config)
  }
}
