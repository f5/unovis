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

export interface NodeDatum {
  id: string;
  i: number;
  label?: string;
  value?: number;
}

export interface LinkDatum {
  id?: string;
  source: string;
  target: string;
  value?: number;
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

export function generateTimeSeries (n = 10, types = n): TimeDataRecord[] {
  const groups = Array(types).fill(0).map((_, i) => String.fromCharCode(i + 65))
  return Array(n).fill(0).map((_, i: number) => ({
    timestamp: Date.now() + i * 1000 * 60 * 60 * 24,
    value: i / 10 + Math.sin(i / 5) + Math.cos(i / 3),
    length: Math.round(1000 * 60 * 60 * 24) * Math.random(),
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
