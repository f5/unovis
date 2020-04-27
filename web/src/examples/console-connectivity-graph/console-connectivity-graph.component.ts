// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'
import _times from 'lodash/times'
import _sample from 'lodash/sample'
import _random from 'lodash/random'
import _flatten from 'lodash/flatten'


import { Graph, SingleChart, GraphConfigInterface } from '@volterra/vis'

import { overviewConfig, drilldownConfig } from './configuration/graph-config'
import consoleData from './data/connectivity.json'

@Component({
  selector: 'console-connectivity-graph',
  templateUrl: './console-connectivity-graph.component.html',
  styleUrls: ['./console-connectivity-graph.component.css'],
})

export class ConnectivityGraphComponent implements OnInit, AfterViewInit {
  @ViewChild('graph', { static: false }) graph: ElementRef
  title = 'graph'
  chart: any
  overviewData = consoleData
  drilldownData
  config: GraphConfigInterface<any, any> = overviewConfig(this.onNodeClick.bind(this))

  component = new Graph(this.config)
  
  ngAfterViewInit (): void {
    console.log(this.overviewData)
    this.chart = new SingleChart(this.graph.nativeElement, { component: this.component }, this.overviewData)
  }

  ngOnInit (): void {
  }

  onNodeClick(d): void {
    console.log(d)

  //   const outgoingLinks = this.overviewData.links.find(l => l.source = d.id)
  //   const incomingLinks = this.overviewData.links.find(l => l.target = d.id)
    const links = this.overviewData.links.filter(l => (l.target === d.id) || (l.source === d.id))
    const connectedNodes = links.map(l => this.overviewData.nodes.find(n => 
      ((n.id === l.source) || (n.id === l.target)) && (n.id !== d.id)
    ))
    const nodes = d.nodes
    const drilldownLinks = _flatten(
      connectedNodes.map(node1 =>
        nodes.map(node2 => ({
          source: node1.id,
          target: node2.id,
          id: `${node1.id}~${node2.id}`
        })
      ))
    )

    this.drilldownData = { nodes: nodes.concat(connectedNodes), links: drilldownLinks }
    this.config = drilldownConfig(() => {})
    this.chart.updateComponent(this.config)
    this.chart.setData(this.drilldownData)
  }
}
