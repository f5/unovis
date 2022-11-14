/* eslint-disable dot-notation */

import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'

import { Graph, GraphConfigInterface, SingleContainer, GraphLayoutType, GraphNode, GraphLink } from '@unovis/ts'

import graphData from './data/ves-io-service-graph.json'

// eslint-disable-next-line @typescript-eslint/naming-convention
const StatusMap = {
  healthy: { color: '#47e845' },
  warning: { color: '#ffc226' },
  inactive: { color: '#dddddd' },
  alert: { color: '#f88080' },
}

function getGraphConfig<N extends GraphNode, L extends GraphLink> (selectedNodeId?): GraphConfigInterface<N, L> {
  return {
    layoutType: GraphLayoutType.Force,
    layoutAutofit: false,
    layoutNonConnectedAside: false,
    forceLayoutSettings: {
      charge: -350,
      linkStrength: 0.15,
    },
    nodeSize: d => 30,
    nodeShape: d => d['shape'],
    nodeGaugeValue: d => d['score'],
    nodeGaugeFill: d => StatusMap[d['status']]?.color,
    nodeIcon: d => d['icon'],
    nodeLabel: d => d['label'],
    nodeSubLabel: d => d['sublabel'],
    layoutNodeGroup: d => d['group'],
    nodeSideLabels: d => d['sideLabels'],
    nodeDisabled: d => d['disabled'],
    nodeFill: d => d['fill'],

    linkArrow: l => l['linkArrow'],
    linkFlow: l => false,
    linkLabel: l => l['linkLabel'],
    linkStroke: l => l['score'] === 100 ? 'rgba(49, 208, 49, 0.500)' : null,
    linkWidth: 0,
    linkBandWidth: 1,

    selectedNodeId,

    events: {
      [Graph.selectors.node]: {
        click: (d) => { this.onNodeClick(d) },
      },
      [Graph.selectors.background]: {
        click: () => { this.onBackgroundClick() },
      },
    },
  }
}

@Component({
  selector: 'service-graph',
  templateUrl: './service-graph.component.html',
  styleUrls: ['./service-graph.component.css'],
})

export class ServiceGraphComponent implements OnInit, AfterViewInit {
  @ViewChild('graph', { static: false }) containerRef: ElementRef
  title = 'service-graph'
  config = { component: new Graph(getGraphConfig.call(this)) }
  vis: SingleContainer<any>

  ngAfterViewInit (): void {
    this.vis = new SingleContainer(this.containerRef.nativeElement, this.config, graphData)
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ngOnInit (): void {}

  onNodeClick (d): void {
    this.vis.updateComponent(getGraphConfig.call(this, d.id))
  }

  onBackgroundClick (): void {
    this.vis.updateComponent(getGraphConfig.call(this))
  }
}
