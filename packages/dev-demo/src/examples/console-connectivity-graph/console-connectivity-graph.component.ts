import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core'
import _flatten from 'lodash-es/flatten'

import { Graph, SingleContainer, GraphConfigInterface } from '@unovis/ts'

import { overviewConfig, drilldownConfig } from './configuration/graph-config'
import consoleData from './data/connectivity.json'

@Component({
  selector: 'console-connectivity-graph',
  templateUrl: './console-connectivity-graph.component.html',
  styleUrls: ['./console-connectivity-graph.component.css'],
})

export class ConnectivityGraphComponent implements AfterViewInit {
  @ViewChild('graph', { static: false }) graph: ElementRef
  title = 'graph'
  chart: any
  overviewData = consoleData
  drilldownData
  config: GraphConfigInterface<any, any> = overviewConfig(this.onNodeClick.bind(this))

  component = new Graph(this.config)

  ngAfterViewInit (): void {
    this.chart = new SingleContainer(this.graph.nativeElement, { component: this.component }, this.overviewData)
  }

  onNodeClick (d): void {
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
          id: `${node1.id}~${node2.id}`,
        })
        ))
    )

    nodes.forEach(n => {
      n.enterPosition = [d.x, d.y]
    })

    this.drilldownData = { nodes: nodes.concat(connectedNodes), links: drilldownLinks }
    this.config = drilldownConfig()
    this.chart.updateComponent(this.config)
    this.chart.setData(this.drilldownData)
  }
}
