// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'
import _times from 'lodash/times'
import _sample from 'lodash/sample'
import _random from 'lodash/random'

import { Graph, SingleChart, GraphLayoutType, GraphConfigInterface, VisControlItemInterface, VisControlsOrientation } from '@volterra/vis'

import { dataGenerator } from './data/datagen'

@Component({
  selector: 'graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css'],
})

export class GraphComponent implements OnInit, AfterViewInit {
  @ViewChild('graph', { static: false }) graph: ElementRef
  title = 'graph'
  chart: any
  data: {}
  config: GraphConfigInterface<any, any> = {
    layoutType: GraphLayoutType.Dagre,
    nodeSize: d => d.nodeSize,
    nodeShape: d => d.shape,
    nodeStrokeSegmentValue: d => d.score,
    nodeIcon: d => d.icon,
    nodeLabel: d => d.label,
    nodeSubLabel: d => d.sublabel,
    nodeGroup: d => d.group,
    nodeSideLabels: d => d.sideLabels,
    nodeDisabled: d => d.disabled,
    nodeFill: d => d.fill,
    linkArrow: d => d.linkArrow,
    linkFlow: d => d.linkFlow,
    linkLabel: d => d.linkLabel,
    onZoom: (scale, scaleExtent) => {
      this.controlItems[1].disabled = scale >= scaleExtent[1]
      this.controlItems[2].disabled = scale <= scaleExtent[0]
      this.controlItems = [...this.controlItems]
    },

    events: {
      [Graph.selectors.node]: {
        click: (d) => { this.onNodeClick(d) }
      },
    },

    attributes: {
      [Graph.selectors.node]: {
        'ves-e2e-node-id': d => d.id,
        'ves-e2e-test': 'node',
      },
      [Graph.selectors.link]: {
        'ves-e2e-source-id': d => d.target.id,
        'ves-e2e-target-id': d => d.target.id,
        'ves-e2e-test': 'link',
      },
    }
  }

  component = new Graph(this.config)
  controlItems: VisControlItemInterface[] = [
    {
      icon: '&#xe986',
      callback: () => { this.component.fitView() },
      borderBottom: true,
    },
    {
      icon: '&#xe936',
      callback: () => { this.component.zoomIn() },
    },
    {
      icon: '&#xe934',
      callback: () => { this.component.zoomOut() },
    },
  ]
  controlsOrientation = VisControlsOrientation.Vertical

  ngAfterViewInit (): void {
    const generator = dataGenerator()
    const data = generator.next().value
    console.log('data', data);

    this.chart = new SingleChart(this.graph.nativeElement, { component: this.component }, data)

    setInterval(() => {
      this.chart.setData(generator.next().value)
    }, 5000)

  }

  ngOnInit (): void {
  }

  onNodeClick (d) {
    this.config.selectedNodeId = d.id

    this.chart.updateComponent(this.config)
  }
}
