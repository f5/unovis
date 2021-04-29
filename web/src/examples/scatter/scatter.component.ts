// Copyright (c) Volterra, Inc. All rights reserved.
import { AfterViewInit, Component } from '@angular/core'
import _random from 'lodash/random'
import _sample from 'lodash/sample'

import { Scatter, Axis, SymbolType, ScatterConfigInterface } from '@volterra/vis'

// Helpers
import { SampleDatum } from '../../utils/data'

interface ScatterDatum extends SampleDatum {
  size: number;
  shape: SymbolType;
  label: any;
}

function sampleScatterData (n: number): ScatterDatum[] {
  const minD = 10
  const maxD = 50
  return Array(n).fill(0).map((d, i) => ({
    x: i,
    y: Math.random(),
    size: _random(minD, maxD),
    shape: Math.random() > 0.2 ? SymbolType.CIRCLE : _sample([SymbolType.CROSS, SymbolType.DIAMOND, SymbolType.SQUARE, SymbolType.STAR, SymbolType.TRIANGLE, SymbolType.WYE]),
    label: Math.random() > 0.8 ? 'G' : undefined,
  }))
}

function getScatterConfig (): ScatterConfigInterface<ScatterDatum> {
  return {
    sizeRange: [10, 25],
    x: (d): number => d.x,
    y: (d): number => d.y,
    size: (d): number => d.size,
    shape: (d): SymbolType => d.shape,
    label: (d): any => d.label,
    cursor: (d) => d.label ? 'pointer' : null,
    color: () => _sample(['#f0aaca', '#6798ff', '#fd7492', '#00edff', '#ed916e', '#425673', '#d11d55']),
    labelColor: () => _sample(['#f0aaca', '#6798ff', '#fd7492', '#00edff', '#ed916e', '#425673', '#d11d55']),
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
  axesGenerator = () => ({
    x: new Axis({ label: 'x axis' }),
    y: new Axis({ label: 'y axis' }),
  })

  ngAfterViewInit (): void {
  }
}
