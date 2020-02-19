// Copyright (c) Volterra, Inc. All rights reserved.
import { AfterViewInit, Component } from '@angular/core'
import _random from 'lodash/random'
import _sample from 'lodash/sample'

import { Scatter } from '@volterra/vis'
import { SymbolType } from '@volterra/vis/types'

// Helpers
import { SampleDatum } from '../../utils/data'

interface ScatterDatum extends SampleDatum {
  size: number;
  shape: SymbolType;
  icon: any;
}

function sampleScatterData (n: number): ScatterDatum[] {
  const minR = n >= 500 ? 5 : null
  const maxR = n >= 500 ? 10 : null
  return Array(n).fill(0).map((d, i) => ({
    x: i,
    y: Math.random(),
    size: minR && maxR ? _random(minR, maxR) : 50,
    shape: Math.random() > 0.8 ? SymbolType.CIRCLE : _sample([SymbolType.CROSS, SymbolType.DIAMOND, SymbolType.SQUARE, SymbolType.STAR, SymbolType.TRIANGLE, SymbolType.WYE]),
    icon: Math.random() > 0.8 ? '☁️' : undefined,
  }))
}

function getScatterConfig () {
  return {
    x: (d): number => d.x,
    y: (d): number => d.y,
    size: (d): number => d.size,
    shape: (d): SymbolType => d.shape,
    icon: (d): any => d.icon,
  }
}

@Component({
  selector: 'scatter',
  templateUrl: './scatter.component.html',
  styleUrls: ['./scatter.component.css'],
})

export class ScatterComponent implements AfterViewInit {
  title = 'scatter'
  component = Scatter

  configGenerator = getScatterConfig
  dataGenerator = sampleScatterData

  ngAfterViewInit (): void {
  }
}
