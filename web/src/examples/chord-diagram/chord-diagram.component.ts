// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, OnInit } from '@angular/core'
import { nest as d3Nest } from 'd3-collection'

// Vis
import { ChordDiagram, ChordDiagramConfigInterface, Hierarchy } from '@volterra/vis'

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
  values: d3Nest<any, any>()
    .key(d => d.site)
    .key(d => d.sublabel)
    .entries(trafficData.nodes),
}

@Component({
  selector: 'chord-diagram',
  templateUrl: './chord-diagram.component.html',
  styleUrls: ['./chord-diagram.component.css'],
})

export class ChordDiagramComponent<H extends Hierarchy> implements OnInit {
  title = 'chord-diagram'

  data = {
    nodes: hierarchy,
    links: trafficData.links,
  }

  margin = {}
  config: ChordDiagramConfigInterface<H> = {
    nodeWidth: 20,
    nodeLabelType: 'along',
  }

  component = new ChordDiagram(this.config)

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ngOnInit (): void {
  }
}
