export type DataRecord = {
  x: number;
  y: number;
}

function createRng (seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

const rng = createRng(0x511)

export const data: DataRecord[] = Array(40).fill(0).map((_, i) => ({
  x: i,
  y: 5.5 + 2 * rng(),
}))

// Five clustered quantile thresholds — mirrors the production case where
// the labels collapse onto the same screen region.
export const thresholds: ReadonlyArray<{ value: number; label: string }> = [
  { value: 5.50, label: '95th: 81.34 kb/s' },
  { value: 5.56, label: '95th: 808.67 kb/s' },
  { value: 5.62, label: '95th: 3.55 Mb/s' },
  { value: 5.68, label: '95th: 4.66 Mb/s' },
  { value: 5.74, label: '95th: 10.83 Mb/s' },
]
