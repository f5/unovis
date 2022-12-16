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
