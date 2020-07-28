// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { Component, AfterViewInit } from '@angular/core'
import _times from 'lodash/times'

// Vis
import { Sankey, SankeyConfigInterface } from '@volterra/vis'

import { sankeySampleData } from './data/datagen'

function sampleSankeyData (n: number) {
  const sources = _times(n).map((d) => `RE ${d+1}`)
  const targets = ['Site', 'VN selector', 'Endpoint 3', 'Endpoint 2', 'Endpoint 3']
  const vhost = ['Balancer']
  const result = sankeySampleData (n, sources, vhost, targets)
  return n === 1 ? { nodes: [result.nodes[0]], links: [] } : result
}

function getSankeyConfig (): SankeyConfigInterface<any, any> {
  return {
    label: d => d.label,
    linkValue: d => d.flow,
    labelMaxWidth: 110,
    subLabel: d => Math.random() > 0.8 ? 'sablabel' : '',
    labelVisibility: (d, bbox) => { return (d.y1 - d.y0) > 0.8 * bbox.height }
  }
}

@Component({
  selector: 'sankey',
  templateUrl: './sankey.component.html',
  styleUrls: ['./sankey.component.css'],
})

export class SankeyComponent implements AfterViewInit {
  title = 'sankey'
  component = Sankey

  dataGenerator = sampleSankeyData
  configGenerator = getSankeyConfig

  ngAfterViewInit (): void {
  }
}
