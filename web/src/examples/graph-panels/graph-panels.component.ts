// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'
import _times from 'lodash/times'
import _sample from 'lodash/sample'
import _random from 'lodash/random'

import { Graph, GraphConfigInterface, SingleChart, LayoutType, NodeDatumCore, LinkDatumCore } from '@volterra/vis'
import { SHAPE } from '@volterra/vis/types'

import graphData from './data/graph.json'


function getGraphConfig<N extends NodeDatumCore, L extends LinkDatumCore> (): GraphConfigInterface<N, L> {
  return {
    layoutType: LayoutType.PARALLEL,
    layoutGroupOrder: [
      'column1',
      'N:ce01-site-local-vn',
      'column3'
    ],
    // statusMap: {
    //   healthy: { color: '#47e845' },
    //   warning: { color: '#ffc226' },
    // },
    panels: [
      {
        label: 'test panel',
        nodes: [
          'test'
        ],
        color: '#333',
        borderWidth: 1,
        padding: 15,
      },
      {
        label: 'ce01-site-local-vn',
        nodes: [
          'N:ce01-site-local-vn-ce01-bookinfo'
        ],
        color: '#333',
        borderWidth: 1,
        padding: 15,
        selectionOutline: true,
        sideLabelIcon: 'T',
        sideLabelShape: SHAPE.CIRCLE,
        sideLabelColor: '#8ee422',
      },
      {
        label: 'details',
        nodes: [
          'S:details-ce02-bookinfo',
          'S:details-UNKNOWN-bookinfo'
        ],
        color: 'gray',
        borderWidth: 1,
        padding: 8,
        selectionOutline: true,
        sideLabelIcon: 'N',
        sideLabelShape: SHAPE.HEXAGON,
        sideLabelColor: '#f88080',
      },
      {
        label: 'reviews',
        nodes: [
          'S:reviews-ce02-bookinfo',
          'S:reviews-UNKNOWN-bookinfo'
        ],
        color: 'gray',
        borderWidth: 1,
        padding: 8,
        selectionOutline: true,
        sideLabelIcon: 'O',
        sideLabelShape: SHAPE.TRIANGLE,
        sideLabelColor: '#acb2b9',
      }
    ],
    nodeSize: d => d['nodeSize'],
    nodeShape: d => d['shape'],
    nodeStrokeSegmentValue: d => d['score'],
    nodeIcon: d => d['icon'],
    nodeLabel: d => d['label'],
    nodeSubLabel: d => d['sublabel'],
    nodeGroup: d => d['group'],
    nodeSideLabels: d => d['sideLabels'],
    nodeDisabled: d => d['disabled'],
    // nodeStatus: d => d['status'],
    linkArrow: d => d['linkArrow'],
    // linkStatus: d => d['status'],
    linkFlow: d => d['linkFlow']
  }
}

@Component({
  selector: 'graph-panels',
  templateUrl: './graph-panels.component.html',
  styleUrls: ['./graph-panels.component.css'],
})

export class GraphPanelsComponent implements OnInit, AfterViewInit {
  title = 'graph-panels'
  chart: any
  data: {}
  config: any
  @ViewChild('graph', { static: false }) graph: ElementRef

  ngAfterViewInit (): void {
    console.log('data', graphData);
    const graphConfig = getGraphConfig()

    const config = {
      component: new Graph(graphConfig),
    }
    new SingleChart(this.graph.nativeElement, config, graphData)
  }

  ngOnInit (): void {
  }
}
