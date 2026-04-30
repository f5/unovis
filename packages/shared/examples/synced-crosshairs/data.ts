export type XYDataRecord = {
  x: number;
  y: number;
  y1?: number;
  y2?: number;
}

function createRng (seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

const rng = createRng(0x5e1)

export const data: XYDataRecord[] = Array(150).fill(0).map((_, i) => ({
  x: i,
  y: 5 + 5 * rng(),
  y1: 1 + 3 * rng(),
  y2: 2 * rng(),
}))

export const accessors = [
  (d: XYDataRecord, i: number): number => (d.y || 0) * i / 100,
  (d: XYDataRecord): number | undefined => d.y1,
  (d: XYDataRecord): number | undefined => d.y2,
]
