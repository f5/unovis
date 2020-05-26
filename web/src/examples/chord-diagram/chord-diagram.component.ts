// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, OnInit } from '@angular/core'
import { nest as d3Nest } from 'd3-collection'
import _cloneDeep from 'lodash/cloneDeep'

// Vis
import { ChordDiagram, ChordDiagramConfigInterface, Hierarchy } from '@volterra/vis'

import trafficData from './data/traffic.json'

const findNode = (nodes, id) => nodes.find(n => n.id === id)
const getData = (data, levels = ['site']) => {
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
  levels.forEach(levelAccessor => {
    nestGen.key(d => d[levelAccessor])
  })
  const hierarchy = {
    values: nestGen.entries(trafficDataCopy.nodes),
  }

  return {
    nodes: hierarchy,
    links: trafficDataCopy.links,
  }
}

@Component({
  selector: 'chord-diagram',
  templateUrl: './chord-diagram.component.html',
  styleUrls: ['./chord-diagram.component.css'],
})

export class ChordDiagramComponent<H extends Hierarchy> implements OnInit {
  title = 'chord-diagram'

  data = getData(trafficData)

  margin = {}
  config: ChordDiagramConfigInterface<H> = {
    nodeWidth: 20,
    nodeLabelType: 'along',
  }

  component = new ChordDiagram(this.config)

  legendItems = [
    { name: 'Service', inactive: false },
    { name: 'Site', inactive: false, key: 'site' },
    { name: 'Namespace', inactive: true, key: 'sublabel' },
  ]

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ngOnInit (): void {
  }

  onLegendItemClick (event): void {
    const { d } = event
    if (d.name === 'Service') return
    d.inactive = !d.inactive
    this.legendItems = [...this.legendItems]
    const nestKeys = this.legendItems.filter(item => !item.inactive && item.name !== 'Service').map(item => item.key)
    this.data = getData(trafficData, nestKeys)
  }
}
