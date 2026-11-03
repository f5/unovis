import { describe, expect, it } from 'vitest'

// Local Utils
import { getThinnedMarkerPath } from '@/components/line/marker'

// Local Types
import { LineDatum } from '@/components/line/types'

/** A line of `count` points spread over `width` pixels, with the points at `gapIndices` missing */
function createValues (count: number, width = 1000, gapIndices: number[] = []): LineDatum[] {
  const gaps = new Set(gapIndices)
  return Array.from({ length: count }, (_, i) => ({
    x: (i * width) / (count - 1),
    y: 100 + i,
    value: gaps.has(i) ? undefined : i,
    defined: !gaps.has(i),
  }))
}

const markerCount = (path: string | null): number => (path?.match(/M/g) ?? []).length
const markerXs = (path: string): number[] => [...path.matchAll(/M([\d.]+),/g)].map(m => Number(m[1]))

describe('Line thinned marker path', () => {
  it('draws no separate path when no spacing is set', () => {
    expect(getThinnedMarkerPath(createValues(5000), 1000, undefined)).toBeNull()
  })

  it('draws no separate path when the line has fewer points than pixels', () => {
    // a smoothing curve wouldn't pass through the points at this density
    expect(getThinnedMarkerPath(createValues(200), 1000, 40)).toBeNull()
  })

  describe('when the line has more points than pixels', () => {
    it('places one marker per `spacing` pixels of width rather than one per point', () => {
      const path = getThinnedMarkerPath(createValues(9000), 1000, 40)

      expect(markerCount(path)).toBe(25)
    })

    it('scales the marker count down with the chart width', () => {
      const narrow = getThinnedMarkerPath(createValues(9000, 400), 400, 40)

      expect(markerCount(narrow)).toBe(10)
    })

    it('spans the full width of the line', () => {
      const xs = markerXs(getThinnedMarkerPath(createValues(9000), 1000, 40) as string)

      expect(xs[0]).toBe(0)
      expect(xs[xs.length - 1]).toBe(1000)
    })

    it('orders the markers left to right', () => {
      const xs = markerXs(getThinnedMarkerPath(createValues(9000, 1000, [4000, 4002]), 1000, 40) as string)

      expect(xs).toEqual([...xs].sort((a, b) => a - b))
    })
  })

  describe('when a point sits on its own between two gaps', () => {
    // `line - gap - point - gap - line`: the point has no segment to sit on, so dropping its
    // marker would remove it from the chart entirely
    const isolatedIndex = 4001
    const values = createValues(9000, 1000, [...Array(1000).keys()].map(i => i + 3500).filter(i => i !== isolatedIndex))

    it('keeps its marker', () => {
      const xs = markerXs(getThinnedMarkerPath(values, 1000, 40) as string)

      expect(xs).toContain(values[isolatedIndex].x)
    })

    it('keeps it in addition to the evenly spaced markers', () => {
      const withIsolated = getThinnedMarkerPath(values, 1000, 40)
      const withoutIsolated = getThinnedMarkerPath(createValues(9000), 1000, 40)

      expect(markerCount(withIsolated)).toBeGreaterThan(markerCount(withoutIsolated) - 1)
    })
  })
})
