export type DataRecord = { x: number; y: number }

// Deterministic data generation so all five framework panels render identically
// for the same (numPoints, seed) state, making side-by-side comparison meaningful.
export function generateData (numPoints: number, seed = 0): DataRecord[] {
  return Array.from({ length: numPoints }, (_, i) => ({
    x: i,
    y: 50 + 40 * Math.sin((i + seed) / 2),
  }))
}

export const DEFAULT_NUM_POINTS = 10
export const DEFAULT_LINE_WIDTH = 2
export const THICK_LINE_WIDTH = 5
