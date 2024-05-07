export type XYDataRecord = {
  x: number;
  y: number | undefined;
  y1?: number;
  y2?: number;
}

export function generateXYDataRecords (n = 10): XYDataRecord[] {
  return Array(n).fill(0).map((_, i) => ({
    x: i,
    y: 5 + 5 * Math.random(),
    y1: 1 + 3 * Math.random(),
    y2: 2 * Math.random(),
  }))
}
