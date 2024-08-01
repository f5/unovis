import { GenericDataRecord } from '@unovis/ts'
import { sample } from './array'
// making non useful updates

export type XYDataRecord = {
  x: number;
  y: number | undefined;
  y1?: number;
  y2?: number;
}

export type StackedDataRecord = {
  x: number;
  ys: number[];
}
export interface TimeDataRecord {
  timestamp: number;
  value: number;
  length: number;
  type?: string;
}

export type NodeDatum = GenericDataRecord & {
  id: string;
}

export interface LinkDatum {
  source: string | number | NodeDatum;
  target: string | number | NodeDatum;
  value: number;
}
export interface NodeLinkData {
  nodes: NodeDatum[];
  links: LinkDatum[];
}

export type NestedDatum = GenericDataRecord & {
  group: string;
  subgroup?: string;
  value?: number | string;
}

export function generateXYDataRecords (n = 10): XYDataRecord[] {
  return Array(n).fill(0).map((_, i) => ({
    x: i,
    y: 5 + 5 * Math.random(),
    y1: 1 + 3 * Math.random(),
    y2: 2 * Math.random(),
  }))
}

export function generateStackedDataRecords (n = 10, count = 6): StackedDataRecord[] {
  return Array(n).fill(0).map((_, i) => ({
    x: i,
    ys: Array(count).fill(0).map((_, i) => (i * count / 3) + (count * Math.random())),
  }))
}

export function generateTimeSeries (n = 10, types = n, lengthMultiplier = 1): TimeDataRecord[] {
  const groups = Array(types).fill(0).map((_, i) => String.fromCharCode(i + 65))
  return Array(n).fill(0).map((_, i: number) => ({
    timestamp: Date.now() + i * 1000 * 60 * 60 * 24 + (Math.random() - 0.5) * 5 * 1000 * 60 * 60 * 24,
    value: i / 10 + Math.sin(i / 5) + Math.cos(i / 3),
    length: Math.round(lengthMultiplier * 1000 * 60 * 60 * 24) * (0.2 + Math.random()),
    type: groups[i % groups.length],
  }))
}


export function generateNodeLinkData (n = 10, numNeighbourLinks = () => 1): NodeLinkData {
  const nodes = Array(n).fill(0).map((_, i) => ({ i, id: (i + 1).toString(), value: 100 * Math.random() }))
  const options = [...nodes].slice(1)
  const links = nodes.reduce((arr, n) => {
    if (options.length) {
      const num = Math.max(1, Math.random() * options.length)
      for (let i = 0; i < num; i++) {
        const targetId = options.shift()?.id
        for (let k = 0; k < numNeighbourLinks(); k++) {
          const link = {
            id: `${n.id}-${targetId}`,
            source: n.id,
            target: targetId,
            value: Math.random(),
          }
          arr.push(link)
        }
      }
    }
    return arr
  }, Array(0))
  return { nodes, links }
}


export function generatePrecalculatedNodeLinkData (n = 10, numNeighbourLinks = () => 1): NodeLinkData {
  const nodes = Array(n).fill(0).map((_, i) => ({
    i,
    id: (i + 1).toString(),
    value: 100 * Math.random(),
    x: 50 * i,
    y: 50 * i,
  }))
  const options = [...nodes].slice(1)
  const links = nodes.reduce((arr, n) => {
    if (options.length) {
      const num = Math.max(1, Math.random() * options.length)
      for (let i = 0; i < num; i++) {
        const targetId = options.shift()?.id
        for (let k = 0; k < numNeighbourLinks(); k++) {
          const link = {
            id: `${n.id}-${targetId}`,
            source: n.id,
            target: targetId,
            value: Math.random(),
          }
          arr.push(link)
        }
      }
    }
    return arr
  }, Array(0))
  return { nodes, links }
}

export function generateNestedData (n: number, numGroups: number, excludeValues?: string[]): NestedDatum[] {
  const groups = Array(numGroups).fill(0).map((_, i) => String.fromCharCode(i + 65))
  const subgroups = Object.fromEntries(groups.map((g, i) => [g, Array(Math.floor(numGroups * 1.5)).fill(0).map((_, j) => `${g}${j}`)]))
  return Array(n).fill(0).map(() => {
    const group = sample(groups)
    const subgroup = sample(subgroups[group])
    return {
      group,
      subgroup,
      value: excludeValues?.includes(subgroup) ? undefined : `${subgroup}${sample(groups.map(g => g.toLowerCase()))}`,
    }
  })
}

export function generateHierarchyData (n: number, levels: Record<string, number>): NodeLinkData {
  const nodes = Array(n).fill(0).map((_, i) => {
    const obj: NodeDatum = { id: i.toString(), label: `N${i}` }
    Object.keys(levels).forEach(key => {
      obj[key] = `${key}${Math.floor(Math.random() * levels[key])}`
    })
    return obj
  })
  return {
    nodes,
    links: Array(n / 2).fill(0).map(() => ({
      source: sample(nodes),
      target: sample(nodes),
      value: Math.random(),
    })),
  }
}
