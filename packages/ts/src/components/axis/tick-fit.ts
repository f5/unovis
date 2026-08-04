// Types
import { Rect } from '@/types/misc'
import { ContinuousScale } from '@/types/scale'

// Utils
import { isEqual } from '@/utils/data'
import { rectIntersect } from '@/utils/misc'
import { resolveRectsOverlap } from '@/utils/text-overlap'

// Local Types
import { FittedTickValues, TickValues } from './types'

/** Tick value identity across renders; `+value` so equal `Date`s match */
export const tickKey = (value: number | Date): string => String(+value)

/** Merges two tick sets, deduplicated and sorted */
export const mergeTickValues = (a: TickValues, b: TickValues): TickValues => {
  const keys = new Set(a.map(tickKey))
  const extra = b.filter(value => !keys.has(tickKey(value)))
  if (!extra.length) return a

  return [...a, ...extra].sort((x, y) => +x - +y)
}

/** Returns the tick values to render as marks, restricting the step to 1 or 5 × 10^k.
 * Every coarser "nice" step is then a multiple of the mark step, so the label sets picked by
 * {@link findFittingTickValues} land on existing marks and label changes don't add or remove
 * ticks — visibility toggles animate in CSS with no tick lifecycle management.
 * Time scales are returned as is: their tick intervals don't form a nested ladder. */
export function getNestedTickValues (scale: ContinuousScale, maxNumTicks: number, values: TickValues = scale.ticks(maxNumTicks)): TickValues {
  if (values.length < 2 || values[0] instanceof Date) return values

  const step = (values[1] as number) - (values[0] as number)
  const stepPower = Math.floor(Math.log10(step))
  const stepMantissa = step / Math.pow(10, stepPower)
  if (Math.round(stepMantissa) !== 2) return values

  // Doubling the requested count makes d3 pick the next finer (1 × 10^k) step
  return scale.ticks(maxNumTicks * 2)
}

/** Generates candidate tick sets in decreasing size, from `maxNumTicks` down to a single tick.
 * Consecutive counts often produce the same "nice" values, so the sets are deduplicated. */
export function getTickValueCandidates (scale: ContinuousScale, maxNumTicks: number): TickValues[] {
  const candidates: TickValues[] = []
  for (let n = maxNumTicks; n >= 1; n -= 1) {
    const values: TickValues = scale.ticks(n)
    const previous = candidates[candidates.length - 1]
    if (!previous || !isEqual(values, previous)) candidates.push(values)
  }
  return candidates
}

/** Generates candidate subsets of a custom tick list in decreasing size — every value,
 * every 2nd, every 3rd and so on, anchored at the first value so the labeled ticks
 * stay evenly spaced. Used when explicit `tickValues` are fitted adaptively. */
export function getTickValueSubsetCandidates (values: TickValues): TickValues[] {
  const candidates: TickValues[] = []
  for (let k = 1; k <= values.length; k += 1) {
    const subset = values.filter((_, i) => i % k === 0)
    const previous = candidates[candidates.length - 1]
    if (!previous || subset.length < previous.length) candidates.push(subset)
  }
  return candidates
}

/** Indices of the adjacent rect pairs that collide: `0` for the (0, 1) pair and so on.
 * The rects are expected to be ordered along one axis, the way tick labels are */
function getCollidingAdjacentPairs (rects: Rect[], tolerance: number): number[] {
  const pairs: number[] = []
  for (let pair = 0; pair < rects.length - 1; pair += 1) {
    if (rectIntersect(rects[pair], rects[pair + 1], tolerance)) pairs.push(pair)
  }
  return pairs
}

/** Finds the largest tick set whose labels don't overlap, among `candidates` ordered from
 * the densest to the sparsest (see {@link getTickValueCandidates}). Label rects come from
 * `getLabelRects`, which is expected to predict them without rendering (see
 * `Axis._getTickLabelRects`). The search stops at the first fitting candidate.
 * `tolerance` is forwarded to `resolveRectsOverlap`. */
export function findFittingTickValues (
  candidates: TickValues[],
  getLabelRects: (values: TickValues) => Rect[],
  tolerance = 0
): FittedTickValues | undefined {
  const fits = (rects: Rect[]): boolean =>
    resolveRectsOverlap(rects, { tolerance }).every(visible => visible)

  for (const fittedTicks of candidates) {
    const rects = getLabelRects(fittedTicks)
    if (fits(rects)) return { fittedTicks, labeledTicks: fittedTicks }

    // A candidate whose only colliding labels are the extreme (first / last) ones
    // is still used: the extreme labels are dropped, while their ticks stay
    const collidingPairs = getCollidingAdjacentPairs(rects, tolerance)
    const firstPair = 0
    const lastPair = rects.length - 2
    const collidesOnExtremesOnly = collidingPairs.length > 0 &&
      collidingPairs.every(pair => pair === firstPair || pair === lastPair)
    if (!collidesOnExtremesOnly) continue

    const labeledTicks = [...fittedTicks]
    if (collidingPairs.includes(lastPair)) labeledTicks.pop()
    if (collidingPairs.includes(firstPair)) labeledTicks.shift()
    // A two-tick candidate loses both labels above — keep the first one, a single label always fits
    if (!labeledTicks.length) labeledTicks.push(fittedTicks[0])

    // The remaining labels get a wider fair share of the axis after the drop,
    // so the subset is re-measured before getting accepted
    if (fits(getLabelRects(labeledTicks))) return { fittedTicks, labeledTicks }
  }

  const sparsestTicks = candidates[candidates.length - 1]
  return sparsestTicks && { fittedTicks: sparsestTicks, labeledTicks: sparsestTicks }
}
