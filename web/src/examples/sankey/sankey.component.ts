// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { Component, AfterViewInit } from '@angular/core'

// Vis
import { Sankey } from '@volterra/vis'

import sankeyManyData from './data/many.json'
import sankeySingleData from './data/single.json'
import sankeyZeroData from './data/zero.json'
import sankeyFewData from './data/few.json'

function sampleSankeyData (n: number) {
  switch(n) {
    case 0: return sankeyZeroData
    case 1: return sankeySingleData
    case 30: return sankeyFewData
    case 50: return sankeyFewData
    case 500: return sankeyManyData
  }
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
