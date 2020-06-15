// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'
import _times from 'lodash/times'
import _sample from 'lodash/sample'
import _random from 'lodash/random'

import { Graph, SingleChart, LayoutType, GraphConfigInterface, VisControlItemInterface, VisControlsOrientation } from '@volterra/vis'

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
    layoutType: LayoutType.DAGRE,
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

    events: {
      [Graph.selectors.node]: {
        click: (d) => { this.onNodeClick(d) }
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
  controlsOrientation = VisControlsOrientation.VERTICAL
  
  ngAfterViewInit (): void {
    const generator = dataGenerator()
    const data = generator.next().value
    console.log('data', data);

    this.chart = new SingleChart(this.graph.nativeElement, { component: this.component }, data)

    this.component.disableZoomIn.subscribe((disabled: boolean) => {
      this.controlItems[1].disabled = disabled
      this.controlItems = [...this.controlItems]
    })
    this.component.disableZoomOut.subscribe((disabled: boolean) => {
      this.controlItems[2].disabled = disabled
      this.controlItems = [...this.controlItems]
    })

    // setInterval(() => {
    //   chart.setData(generator.next().value)
    // }, 3000)

  }

  ngOnInit (): void {
  }

  onNodeClick (d) {
    this.config.selectedNodeId = d.id

    this.chart.updateComponent(this.config)
  }
}
