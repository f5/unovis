import { sample } from './array'

export type XYDataRecord = {
  x: number;
  y: number;
  y1: number;
  y2: number;
}
export interface TimeDataRecord {
  timestamp: number;
  value: number;
  length: number;
  type?: string;
}

export type NodeDatum = Record<string, any> & {
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

export function generateXYDataRecords (n = 10): XYDataRecord[] {
  return Array(n).fill(0).map((_, i) => ({
    x: i,
    y: 5 + 5 * Math.random(),
    y1: 1 + 3 * Math.random(),
    y2: 2 * Math.random(),
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
            id: `${i}-${k}`,
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

export function generateHierarchyData (n: number, levels: Record<string, number>): NodeLinkData {
  const groupData = Object.entries(levels).reduce((groups, [label, count]) => {
    const d = Object.keys(Array(count).fill(0))
    groups.set(label, d)
    return groups
  }, new Map<string, string[]>())

  const nodes = Array(n).fill(0).map((_, i) => {
    const obj: NodeDatum = { id: i.toString(), label: `N${i}` }
    groupData.forEach((data, key) => {
      obj[key] = `${key}-${data[i % data.length]}`
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
