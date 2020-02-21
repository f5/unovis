// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { Component, AfterViewInit } from '@angular/core'
import _times from 'lodash/times'

// Vis
import { Sankey } from '@volterra/vis'

import { sankeySampleData } from './data/datagen'

function sampleSankeyData (n: number) {
  const sources = _times(n).map((d) => `RE${d+1}`)
  const targets = ['Site', 'VN selector', 'Endpoint 1', 'Endpoint 2', 'Endpoint 3']
  const vhost = ['Balancer']

  return sankeySampleData (n, sources, vhost, targets)
}

function getSankeyConfig () {
  return {
    nodeLabel: d => d.label,
    linkValue: d => d.flow,
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
