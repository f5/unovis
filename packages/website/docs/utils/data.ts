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

export function generateTimeSeries (n = 10): TimeDataRecord[] {
  return Array(n).fill(0).map((_, i: number) => ({
    timestamp: Date.now() + i * 1000 * 60 * 60 * 24,
    value: i / 10 + Math.sin(i / 5) + Math.cos(i / 3),
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
}

export interface NodeLinkData {
  nodes: NodeDatum[];
  links: { source: NodeDatum; target: NodeDatum }[];
}

export function generateNodeLinkData (n = 10): NodeLinkData {
  const nodes = Array(n).fill(0).map((_, i) => ({ id: (i + 1).toString() }))
  const options = [...nodes].slice(1)
  const links = nodes.reduce((arr, n) => {
    if (options.length) {
      const num = Math.max(1, Math.random() * options.length)
      for (let i = 0; i < num; i++) arr.push({ source: n.id, target: options.shift().id })
    }
    return arr
  }, [])
  return { nodes, links }
}

