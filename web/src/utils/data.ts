// Copyright (c) Volterra, Inc. All rights reserved.
import _times from 'lodash/times'
import _uniqueId from 'lodash/uniqueId'
import _sample from 'lodash/sample'

export interface SampleDatum {
  id?: string;
  x: number;
  y: number;
  y1?: number;
  y2?: number;
  y3?: number;
  y4?: number;
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

export interface SampleTimelineDatum {
  time: number;
  duration: number;
  id?: string;
  type?: string;
  color?: string;
  width?: number;
}

export function sampleTimelineData (n: number): SampleTimelineDatum[] {
  const colors = ['#e65239', '#f7c44e', '#8bb2f7']
  return _times(n).map((i) => ({
    // id: _uniqueId(),
    time: Date.now() - Math.round((1000 * 60 * 60 * 24) * Math.random()),
    duration: Math.round((1000 * 60 * 60 * 4) * Math.random()),
    color: _sample(colors),
    width: 5 + Math.round(5 * Math.random()),
  }))
}
