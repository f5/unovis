// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, OnInit } from '@angular/core'
import { nest as d3Nest } from 'd3-collection'
import _cloneDeep from 'lodash/cloneDeep'

// Vis
import { ChordDiagram, ChordDiagramConfigInterface, Hierarchy } from '@volterra/vis'

import trafficData from './data/traffic.json'

const findNode = (nodes, id) => nodes.find(n => n.id === id)
const getData = (data, level = 1) => {
  const trafficDataCopy = _cloneDeep(data)
  trafficDataCopy.links.forEach((l: any) => {
    const sourceNode = findNode(trafficDataCopy.nodes, l.source)
    const targetNode = findNode(trafficDataCopy.nodes, l.target)
    const value = 1 + Math.random()
    l.value = value
    sourceNode.value = (sourceNode.value || 0) + value
    targetNode.value = (targetNode.value || 0) + value
  })

  const nestGen = d3Nest<any, any>()
  for (let i = 0; i < level; i += 1) {
    nestGen.key(d => d.site)
  }
  const hierarchy = {
    values: nestGen.entries(trafficDataCopy.nodes),
  }

  return {
    nodes: hierarchy,
    links: trafficDataCopy.links,
  }
}

const chordDataLevel1 = getData(trafficData)
const chordDataLevel2 = getData(trafficData, 2)

@Component({
  selector: 'chord-diagram',
  templateUrl: './chord-diagram.component.html',
  styleUrls: ['./chord-diagram.component.css'],
})

export class ChordDiagramComponent<H extends Hierarchy> implements OnInit {
  title = 'chord-diagram'

  data = chordDataLevel1

  margin = {}
  config: ChordDiagramConfigInterface<H> = {
    nodeWidth: 20,
    nodeLabelType: 'along',
  }

  component = new ChordDiagram(this.config)

  legendItems = [
    { name: 'Level 1', inactive: false },
    { name: 'Level 2', inactive: true },
  ]

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ngOnInit (): void {
  }

  onLegendItemClick (event): void {
    const { d } = event
    if (d.name === 'Level 1') {
      this.data = chordDataLevel1
      this.legendItems = [
        { name: 'Level 1', inactive: false },
        { name: 'Level 2', inactive: true },
      ]
    } else {
      this.data = chordDataLevel2
      this.legendItems = [
        { name: 'Level 1', inactive: true },
        { name: 'Level 2', inactive: false },
      ]
    }
  }
}
