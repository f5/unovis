// Copyright (c) Volterra, Inc. All rights reserved.
import _times from 'lodash/times'

export function sampleSeriesData (n: number): object[] {
  return _times(n).map((i) => ({
    x: i,
    y: Math.random(),
    y1: Math.random(),
    y2: Math.random(),
    y3: Math.random(),
    y4: Math.random(),
  }))
}
