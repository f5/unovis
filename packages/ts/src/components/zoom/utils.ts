// Types
import { ContinuousScale } from '@/types/scale'

// Utils
import { clamp } from '@/utils/data'

/** Returns the domain of `scale` after zooming by the factor `k` (`k > 1` zooms in) and panning, so that
 * the point at `fromPx` (in the scale's range) ends up at `toPx`. With `fromPx === toPx` it's a zoom around
 * that point, and with `k === 1` it's a pan. Works with any continuous scale, because the transform is done
 * in the screen space and then inverted */
export function transformDomain (scale: ContinuousScale, k: number, fromPx: number, toPx: number): [number, number] {
  const s = scale.copy().clamp(false)
  const [r0, r1] = s.range()
  return [+s.invert(fromPx - (toPx - r0) / k), +s.invert(fromPx + (r1 - toPx) / k)]
}

/** Constrains `domain` to fit into `extent` and to be at least `minSpan` wide. When the span gets limited,
 * `anchor` (a value within the domain, its center by default) keeps its relative position */
export function constrainDomain (
  domain: [number, number],
  extent: [number, number],
  minSpan = 0,
  anchor?: number
): [number, number] {
  const [d0, d1] = domain
  const [e0, e1] = extent
  const span = d1 - d0
  const maxSpan = e1 - e0
  const constrainedSpan = clamp(span, Math.min(minSpan, maxSpan), maxSpan)

  const anchorValue = anchor ?? (d0 + d1) / 2
  const anchorRatio = span ? clamp((anchorValue - d0) / span, 0, 1) : 0.5
  let start = anchorValue - anchorRatio * constrainedSpan
  start = clamp(start, e0, e1 - constrainedSpan)

  return [start, start + constrainedSpan]
}

/** Returns the smallest positive step between the provided (unsorted) values, or `undefined` if there isn't one */
export function getMinStep (values: number[]): number | undefined {
  const sorted = values.filter(v => isFinite(v)).sort((a, b) => a - b)
  let minStep: number | undefined
  for (let i = 1; i < sorted.length; i += 1) {
    const step = sorted[i] - sorted[i - 1]
    if (step > 0 && (minStep === undefined || step < minStep)) minStep = step
  }
  return minStep
}
