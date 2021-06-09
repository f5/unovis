// Copyright (c) Volterra, Inc. All rights reserved.
import _times from 'lodash/times'
import _uniqueId from 'lodash/uniqueId'
import _sample from 'lodash/sample'
import { nest as d3Nest } from 'd3-collection'
import { sum } from 'd3-array'
import { Hierarchy } from '@volterra/vis'

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
    timestamp: Date.now() + i * 1000 * 60 * 15,
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

export function getHierarchyData (n: number, structure: {[key: string]: string[]}): Hierarchy {
  const keys = Object.keys(structure)
  const numericValueKey = 'value'
  const idKey = 'id'

  const data = Array(n).fill(0).map((_, i) => {
    const record = {}
    for (const key of keys) record[key] = _sample(structure[key])
    record[numericValueKey] = Math.random()
    record[idKey] = i

    return record
  })

  const nest = d3Nest<any, any>()
  for (const key of keys) nest.key(d => d[key])
  nest.rollup(arr => sum(arr, d => d[numericValueKey]))

  const tree = { values: nest.entries(Object.values(data)) }

  return tree
}

export function forAllChildren (tree, f, prop = 'values'): void {
  if (tree[prop]) {
    tree[prop].forEach((child) => { forAllChildren(child, f) })
  } else f(tree)
}
