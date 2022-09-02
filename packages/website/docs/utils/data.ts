export const sample = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
export interface DataRecord {
  x: number;
  y: number;
  y1: number;
  y2: number;
  y3: number;
  baseline?: number;
}

export interface TimeDataRecord {
  timestamp: number;
  value: number;
  length?: number;
  type?: string;
}

export function generateDataRecords (n = 10): DataRecord[] {
  return Array(n).fill(0).map((_, i: number) => ({
    x: i,
    y: 5 + 5 * Math.random(),
    y1: 1 + 3 * Math.random(),
    y2: 2 * Math.random(),
    y3: -1 - 2 * Math.random(),
    y4: 3 * Math.random(),
    baseline: 2 * Math.random() - 0.5,
  }))
}

export const data = generateDataRecords(10)

export function generateTimeSeries (n = 10, types = n): TimeDataRecord[] {
  const groups = Array(types).fill(0).map((_, i) => String.fromCharCode(i + 65))
  return Array(n).fill(0).map((_, i: number) => ({
    timestamp: Date.now() + i * 1000 * 60 * 60 * 24,
    value: i / 10 + Math.sin(i / 5) + Math.cos(i / 3),
    length: Math.round(1000 * 60 * 60 * 24) * Math.random(),
    type: i > groups.length ? sample(groups) : groups[i],
  }))
}

export const timeSeriesData = generateTimeSeries(10)

export interface ScatterDataRecord {
  x: number;
  y: number;
  size: number;
  label: string;
  color: string | undefined;
}

export function generateScatterDataRecords (n = 10, colored = false): ScatterDataRecord[] {
  const colors = ['#6A9DFF', '#1acb9a', '#8777d9']

  return Array(n).fill(0).map((_, i: number) => ({
    x: i,
    y: 5 + 5 * Math.random(),
    size: 1 + 3 * Math.random(),
    color: colored ? colors[i % colors.length] : undefined,
    label: `${i}`,
  }))
}

type NodeDatum = {
  id: string;
  label?: string;
  value?: number;
}

type LinkDatum = {
  id?: string;
  source: NodeDatum | string;
  target: NodeDatum | string;
  value?: number;
}
export interface NodeLinkData {
  nodes: NodeDatum[];
  links: LinkDatum[];
}

export function generateNodeLinkData (n = 10, numNeighbourLinks = () => 1): NodeLinkData {
  const nodes = Array(n).fill(0).map((_, i) => ({ id: (i + 1).toString(), value: 100 * Math.random() }))
  const options = [...nodes].slice(1)
  const links = nodes.reduce((arr, n) => {
    if (options.length) {
      const num = Math.max(1, Math.random() * options.length)
      for (let i = 0; i < num; i++) {
        const targetId = options.shift().id
        for (let k = 0; k < numNeighbourLinks(); k++) {
          arr.push({
            id: `${i}-${k}`,
            source: n.id,
            target: targetId,
            value: Math.random(),
          })
        }
      }
    }
    return arr
  }, [])
  return { nodes, links }
}


function generateLinks (n: number, count: number): number[] {
  if (count === 0) {
    return []
  }
  const val = count === 1 ? n : (n / 2) + (Math.random() < 0.5 ? -1 : 1) * Math.floor(Math.random() * (n / 3))
  return [val, ...generateLinks(n - val, count - 1)]
}

export const sankeyData = (src: number, edges: [[number, number]], subDataCount = 4): NodeLinkData => {
  const nodes = [{ id: 'A', val: src, x: 0 }]
  const links = []
  for (let i = 0; i < edges.length; i++) {
    const vals = generateLinks(nodes[i].val, edges[i].length)
    for (let j = 0; j < edges[i].length; j++) {
      if (edges[i][j] >= nodes.length) {
        nodes.push({
          id: String.fromCharCode(65 + nodes.length),
          val: vals[j],
          x: Math.floor(Math.random() * subDataCount),
        })
      }
      links.push({ source: nodes[i].id, target: nodes[edges[i][j]].id, value: vals[j] })
    }
  }
  return { nodes, links }
}

