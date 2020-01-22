// Copyright (c) Volterra, Inc. All rights reserved.
import _times from 'lodash/times'
import _uniqueId from 'lodash/uniqueId'

export interface SampleDatum {
  id: string;
  x: number;
  y: number;
  y1: number;
  y2: number;
  y3: number;
  y4: number;
}

export function sampleSeriesData (n: number): SampleDatum[] {
  return _times(n).map((i) => ({
    id: _uniqueId(),
    x: i,
    y: Math.random(),
    y1: Math.random(),
    y2: Math.random(),
    y3: Math.random(),
    y4: Math.random(),
  }))
}
