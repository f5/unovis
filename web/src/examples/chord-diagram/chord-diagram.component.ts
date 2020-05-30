// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, OnInit } from '@angular/core'

// Vis
import { ChordDiagram, ChordDiagramConfigInterface, Hierarchy } from '@volterra/vis'

import trafficData from './data/traffic.json'

trafficData.links.forEach((l: any) => {
  const value = 1 + Math.random()
  l.value = value
})

@Component({
  selector: 'chord-diagram',
  templateUrl: './chord-diagram.component.html',
  styleUrls: ['./chord-diagram.component.css'],
})

export class ChordDiagramComponent<N extends Hierarchy> implements OnInit {
  title = 'chord-diagram'

  data = trafficData

  margin = {}
  config: ChordDiagramConfigInterface<N> = {
    nodeWidth: 20,
    nodeLabelType: 'along',
    nodeColor: d => {
      const colors = this.legendItems.filter(item => !item.inactive).map(d => d.color)
      return colors[d.height]
    },
    nodeLevels: ['site'],
  }

  component = new ChordDiagram(this.config)

  legendItems = [
    { name: 'Service', inactive: false, color: 'var(--vis-color0)' },
    { name: 'Site', inactive: false, key: 'site', color: 'var(--vis-color1)' },
    { name: 'Namespace', inactive: true, key: 'sublabel', color: 'var(--vis-color2)' },
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
    const config = { ...this.config, nodeLevels: nestKeys }
    this.config = config
  }
}
