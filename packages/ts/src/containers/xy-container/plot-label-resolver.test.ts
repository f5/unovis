import { describe, expect, it } from 'vitest'

import { Rect } from '../../types/misc'
import { TextAlign, VerticalAlign } from '../../types/text'
import { projectLabelRect, rectInside, resolveHideOverflow } from './plot-label-resolver'

describe('projectLabelRect', () => {
  it('Left/Top: rect anchored at (x, y)', () => {
    expect(projectLabelRect(
      { x: 100, y: 50, rotation: 0, textAlign: TextAlign.Left, verticalAlign: VerticalAlign.Top },
      40, 14
    )).toEqual({ x: 100, y: 50, width: 40, height: 14 })
  })

  it('Center/Middle: rect centered on (x, y)', () => {
    expect(projectLabelRect(
      { x: 100, y: 50, rotation: 0, textAlign: TextAlign.Center, verticalAlign: VerticalAlign.Middle },
      40, 14
    )).toEqual({ x: 80, y: 43, width: 40, height: 14 })
  })

  it('Right/Bottom: rect right- and bottom-aligned to (x, y)', () => {
    expect(projectLabelRect(
      { x: 100, y: 50, rotation: 0, textAlign: TextAlign.Right, verticalAlign: VerticalAlign.Bottom },
      40, 14
    )).toEqual({ x: 60, y: 36, width: 40, height: 14 })
  })
})

describe('resolveHideOverflow', () => {
  const bounds: Rect = { x: 0, y: 0, width: 400, height: 200 }
  const rect = (x: number): Rect => ({ x, y: 50, width: 30, height: 14 })

  it('keeps a candidate clear of everything', () => {
    expect(resolveHideOverflow([rect(200)], [], bounds)).toEqual([true])
  })

  it('hides a candidate that clashes with a fixed (positioned) label', () => {
    expect(resolveHideOverflow([rect(100)], [rect(100)], bounds)).toEqual([false])
  })

  it('hides an out-of-bounds candidate', () => {
    expect(resolveHideOverflow([rect(500)], [], bounds)).toEqual([false])
  })

  it('keeps an unmeasured (null) candidate', () => {
    expect(resolveHideOverflow([null], [], bounds)).toEqual([true])
  })

  it('resolves mutual collisions keeping the earlier candidate', () => {
    // rect(100) spans x∈[100,130], rect(110) spans x∈[110,140] → they overlap
    expect(resolveHideOverflow([rect(100), rect(110)], [], bounds)).toEqual([true, false])
    // Non-overlapping pair both survive
    expect(resolveHideOverflow([rect(100), rect(200)], [], bounds)).toEqual([true, true])
  })
})
