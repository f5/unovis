import { describe, expect, it } from 'vitest'

import { LabelOverflow, PlotLabelLayoutInfo } from '../../types/plot-label'
import { Rect, projectLabelRect, rectInside, totalOverlap, tryPlaceLabel } from './plot-label-resolver'

function fakeInfo (opts: {
  preferredAnchor: string;
  candidatePositions: Record<string, { x: number; y: number }>;
  participatesInAuto?: boolean;
  overflow?: LabelOverflow;
}): PlotLabelLayoutInfo {
  return {
    labelEl: {} as SVGTextElement, // not used by tryPlaceLabel
    preferredAnchor: opts.preferredAnchor,
    candidates: Object.keys(opts.candidatePositions),
    participatesInAuto: opts.participatesInAuto ?? true,
    overflow: opts.overflow ?? LabelOverflow.Smart,
    computeLayout: (anchor: string) => {
      const pos = opts.candidatePositions[anchor]
      return {
        x: pos.x,
        y: pos.y,
        transform: '',
        textAnchor: 'start',
        dominantBaseline: 'text-before-edge',
      }
    },
  }
}

describe('projectLabelRect', () => {
  it('start/text-before-edge: rect anchored at (x, y)', () => {
    expect(projectLabelRect(
      { x: 100, y: 50, transform: '', textAnchor: 'start', dominantBaseline: 'text-before-edge' },
      40, 14
    )).toEqual({ x: 100, y: 50, width: 40, height: 14 })
  })

  it('middle/middle: rect centered on (x, y)', () => {
    expect(projectLabelRect(
      { x: 100, y: 50, transform: '', textAnchor: 'middle', dominantBaseline: 'middle' },
      40, 14
    )).toEqual({ x: 80, y: 43, width: 40, height: 14 })
  })

  it('end/text-after-edge: rect right- and bottom-aligned to (x, y)', () => {
    expect(projectLabelRect(
      { x: 100, y: 50, transform: '', textAnchor: 'end', dominantBaseline: 'text-after-edge' },
      40, 14
    )).toEqual({ x: 60, y: 36, width: 40, height: 14 })
  })
})

describe('rectInside', () => {
  const bounds: Rect = { x: 0, y: 0, width: 400, height: 200 }
  it('inside', () => expect(rectInside({ x: 10, y: 10, width: 50, height: 20 }, bounds)).toBe(true))
  it('right edge', () => expect(rectInside({ x: 350, y: 10, width: 50, height: 20 }, bounds)).toBe(true))
  it('overflows right', () => expect(rectInside({ x: 380, y: 10, width: 50, height: 20 }, bounds)).toBe(false))
  it('overflows left', () => expect(rectInside({ x: -1, y: 10, width: 50, height: 20 }, bounds)).toBe(false))
  it('overflows bottom', () => expect(rectInside({ x: 10, y: 190, width: 50, height: 20 }, bounds)).toBe(false))
})

describe('totalOverlap', () => {
  it('no overlap → 0', () => {
    expect(totalOverlap({ x: 0, y: 0, width: 10, height: 10 }, [{ x: 100, y: 100, width: 10, height: 10 }])).toBe(0)
  })
  it('full overlap → product of dims', () => {
    expect(totalOverlap({ x: 0, y: 0, width: 10, height: 10 }, [{ x: 0, y: 0, width: 10, height: 10 }])).toBe(100)
  })
  it('partial overlap accumulates across placed', () => {
    const r = { x: 0, y: 0, width: 10, height: 10 }
    const placed = [
      { x: 5, y: 0, width: 10, height: 10 }, // overlaps 5×10=50
      { x: 0, y: 5, width: 10, height: 10 }, // overlaps 10×5=50
    ]
    expect(totalOverlap(r, placed)).toBe(100)
  })
})

describe('tryPlaceLabel', () => {
  const baseRect: Rect = { x: 0, y: 0, width: 30, height: 14 }
  const bounds: Rect = { x: 0, y: 0, width: 400, height: 200 }

  it('returns preferred when no collision and in bounds', () => {
    const info = fakeInfo({
      preferredAnchor: 'top',
      candidatePositions: { top: { x: 100, y: 50 }, bottom: { x: 100, y: 150 } },
    })
    const r = tryPlaceLabel(info, baseRect, [], bounds)
    expect(r.visible).toBe(true)
    expect(r.layout.x).toBe(100)
    expect(r.layout.y).toBe(50)
  })

  it('skips colliding preferred and picks next clean candidate', () => {
    const info = fakeInfo({
      preferredAnchor: 'top',
      candidatePositions: { top: { x: 100, y: 50 }, bottom: { x: 100, y: 150 } },
    })
    const placed: Rect[] = [{ x: 100, y: 50, width: 30, height: 14 }] // collides with `top`
    const r = tryPlaceLabel(info, baseRect, placed, bounds)
    expect(r.layout.y).toBe(150) // moved to `bottom`
  })

  it('rejects out-of-bounds candidates', () => {
    const info = fakeInfo({
      preferredAnchor: 'top',
      candidatePositions: { top: { x: 500, y: 50 }, bottom: { x: 100, y: 50 } },
    })
    const r = tryPlaceLabel(info, baseRect, [], bounds)
    // top is out of bounds → falls through to bottom
    expect(r.layout.x).toBe(100)
  })

  it('Hide overflow: marks invisible when no candidate fits', () => {
    const info = fakeInfo({
      preferredAnchor: 'top',
      candidatePositions: { top: { x: 100, y: 50 } },
      overflow: LabelOverflow.Hide,
    })
    const placed: Rect[] = [{ x: 100, y: 50, width: 30, height: 14 }]
    const r = tryPlaceLabel(info, baseRect, placed, bounds)
    expect(r.visible).toBe(false)
    expect(r.rect).toBeNull()
  })

  it('Stack overflow: keeps preferred on no fit', () => {
    const info = fakeInfo({
      preferredAnchor: 'top',
      candidatePositions: { top: { x: 100, y: 50 } },
      overflow: LabelOverflow.Stack,
    })
    const placed: Rect[] = [{ x: 100, y: 50, width: 30, height: 14 }]
    const r = tryPlaceLabel(info, baseRect, placed, bounds)
    expect(r.visible).toBe(true)
    expect(r.layout.x).toBe(100)
  })

  it('BestEffort: picks min-overlap candidate when nothing is collision-free', () => {
    const info = fakeInfo({
      preferredAnchor: 'a',
      candidatePositions: {
        a: { x: 100, y: 50 }, // overlaps 100% w/ placed[0]
        b: { x: 110, y: 50 }, // overlaps partially (20×14=280)
      },
      overflow: LabelOverflow.Smart,
    })
    const placed: Rect[] = [{ x: 100, y: 50, width: 30, height: 14 }]
    const r = tryPlaceLabel(info, baseRect, placed, bounds)
    expect(r.layout.x).toBe(110) // chose b (smaller overlap)
  })

  it('falls back to preferred when no in-bounds candidate exists', () => {
    const info = fakeInfo({
      preferredAnchor: 'top',
      candidatePositions: { top: { x: 500, y: 50 } }, // OOB
    })
    const r = tryPlaceLabel(info, baseRect, [], bounds)
    expect(r.layout.x).toBe(500) // returns preferred even though OOB
    expect(r.visible).toBe(true)
  })

  it('zero-sized base rect → keep preferred without bbox tracking', () => {
    const info = fakeInfo({
      preferredAnchor: 'top',
      candidatePositions: { top: { x: 100, y: 50 } },
    })
    const r = tryPlaceLabel(info, { x: 0, y: 0, width: 0, height: 0 }, [], bounds)
    expect(r.visible).toBe(true)
    expect(r.layout.x).toBe(100)
  })
})
