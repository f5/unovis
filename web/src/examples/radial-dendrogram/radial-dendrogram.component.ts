// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { AfterViewInit, OnDestroy, Component } from '@angular/core'
import { nest as d3Nest } from 'd3-collection'

// Vis
import { ChordDiagram, ChordDiagramConfigInterface, Hierarchy } from '@volterra/vis'

// Helpers
// import { getHierarchyData } from '../../utils/data'

import trafficData from './data/traffic.json'

const findNode = (nodes, id) => nodes.find(n => n.id === id)
trafficData.links.forEach((l: any) => {
  const sourceNode = findNode(trafficData.nodes, l.source)
  const targetNode = findNode(trafficData.nodes, l.target)
  const value = 1 + Math.random()
  l.value = value
  sourceNode.value = (sourceNode.value || 0) + value
  targetNode.value = (targetNode.value || 0) + value
})
const hierarchy = { 
  values: d3Nest<any, any>().key(d => d.site)
    .entries(trafficData.nodes) 
}


@Component({
  selector: 'radial-dendrogram',
  templateUrl: './radial-dendrogram.component.html',
  styleUrls: ['./radial-dendrogram.component.css'],
})

export class RadialDendrogramComponent<H extends Hierarchy> implements AfterViewInit, OnDestroy {
  title = 'radial-dendrogram'


  data = { 
    nodes: hierarchy,
    // getHierarchyData(500, {
    //   source: ['re01',  're02', 're03', 're04'],
    //   target: ['site1', 'site2', 'site3', 'site4', 'site5', 'site6', 'site7', 'site8', 'site9', 'site10'],
    // }), 
    links: trafficData.links
  }

  margin = {}
  config: ChordDiagramConfigInterface<H> = {
    nodeWidth: 20,
    nodeLabelType: 'along'
  }
  
  component = new ChordDiagram(this.config)
  intervalId: NodeJS.Timeout

  ngAfterViewInit (): void {
    console.log(trafficData, hierarchy, this.data.nodes)

    // this.intervalId = setInterval(() => {
    //   this.data = getHierarchyData(100, {
    //     source: ['re01', 're02', 're03', 're04'],
    //     target: ['site1', 'site2', 'site3', 'site4', 'site5', 'site6', 'site7', 'site8', 'site9', 'site10'],
    //   })
    // }, 3000)
  }

  ngOnDestroy () : void {
    clearInterval(this.intervalId)
  }

}


