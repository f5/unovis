import { CountableTimeInterval, timeDay, timeHour, timeMinute, timeMonth, timeSecond, timeWeek, timeYear } from 'd3-time'

// Types
import { Rect } from '@/types/misc'
import { ContinuousScale } from '@/types/scale'

// Utils
import { isEqual } from '@/utils/data'
import { rectIntersect } from '@/utils/misc'
import { resolveRectsOverlap } from '@/utils/text-overlap'

// Local Types
import { AxisTimeTickUnit, FittedTickValues, TickSets, TickValues } from './types'

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

/** Width available to a rotated tick label, along its text, before it gets wrapped or trimmed.
 * Neighbouring rotated labels keep apart either along the axis or across their lines. Once a line
 * clears the next tick across, the text is bounded only by `maxDepth` projected onto it — wrapping
 * tighter would just stack more lines across. Shallower labels can only keep apart along the axis,
 * so their text is bounded by the slot, less the projection of a line's height on it */
export function getRotatedTickTextMaxWidth (
  slotWidth: number,
  angleRad: number,
  lineHeightPx: number,
  maxDepth: number,
  overlapTolerance: number
): number {
  const sin = Math.abs(Math.sin(angleRad))
  const cos = Math.abs(Math.cos(angleRad))
  const lineClearsAcross = slotWidth * sin >= lineHeightPx + overlapTolerance
  return lineClearsAcross
    ? maxDepth / sin
    : Math.max(0, (slotWidth - lineHeightPx * sin) / cos)
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

const fitsWithoutOverlap = (rects: Rect[], tolerance: number): boolean =>
  resolveRectsOverlap(rects, { tolerance }).every(visible => visible)

/** Drops the extreme labels of a candidate that collides only there, keeping their ticks. */
function dropCollidingExtremes (
  fittedTicks: TickValues,
  rects: Rect[],
  getLabelRects: (values: TickValues) => Rect[],
  tolerance: number
): FittedTickValues | undefined {
  const collidingPairs = getCollidingAdjacentPairs(rects, tolerance)
  const firstPair = 0
  const lastPair = rects.length - 2
  const collidesOnExtremesOnly = collidingPairs.length > 0 &&
    collidingPairs.every(pair => pair === firstPair || pair === lastPair)
  if (!collidesOnExtremesOnly) return undefined

  const labeledTicks = [...fittedTicks]
  if (collidingPairs.includes(lastPair)) labeledTicks.pop()
  if (collidingPairs.includes(firstPair)) labeledTicks.shift()
  if (!labeledTicks.length) labeledTicks.push(fittedTicks[0])

  if (fitsWithoutOverlap(getLabelRects(labeledTicks), tolerance)) return { fittedTicks, labeledTicks }
  return undefined
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
  for (const fittedTicks of candidates) {
    const rects = getLabelRects(fittedTicks)
    if (fitsWithoutOverlap(rects, tolerance)) return { fittedTicks, labeledTicks: fittedTicks }

    const fitted = dropCollidingExtremes(fittedTicks, rects, getLabelRects, tolerance)
    if (fitted) return fitted
  }

  const sparsestTicks = candidates[candidates.length - 1]
  return sparsestTicks && { fittedTicks: sparsestTicks, labeledTicks: sparsestTicks }
}

const TIME_TICK_UNIT_INTERVALS: [AxisTimeTickUnit, CountableTimeInterval][] = [
  [AxisTimeTickUnit.Year, timeYear],
  [AxisTimeTickUnit.Month, timeMonth],
  [AxisTimeTickUnit.Week, timeWeek],
  [AxisTimeTickUnit.Day, timeDay],
  [AxisTimeTickUnit.Hour, timeHour],
  [AxisTimeTickUnit.Minute, timeMinute],
  [AxisTimeTickUnit.Second, timeSecond],
]

const MAX_TIME_TICK_GRID_SIZE = 500

export type TimeTickGrid = {
  unit: AxisTimeTickUnit;
  values: Date[];
}

/** Every boundary of one calendar unit within the domain — the coarsest unit still providing
 * `maxNumTicks` of them. Steps over this grid never reset at a month or year boundary. */
export function getTimeTickBaseGrid (domain: TickValues, maxNumTicks: number): TimeTickGrid | undefined {
  const start = new Date(Math.min(+domain[0], +domain[domain.length - 1]))
  const end = new Date(Math.max(+domain[0], +domain[domain.length - 1]))
  if (Number.isNaN(+start) || !(+start < +end)) return undefined

  const boundaryCount = (interval: CountableTimeInterval): number => {
    const startIsBoundary = +interval.floor(start) === +start
    return interval.count(start, end) + (startIsBoundary ? 1 : 0)
  }

  const targetCount = Math.max(2, maxNumTicks)
  let finestFitting: [AxisTimeTickUnit, CountableTimeInterval] | undefined
  for (const unitInterval of TIME_TICK_UNIT_INTERVALS) {
    const count = boundaryCount(unitInterval[1])
    if (count > MAX_TIME_TICK_GRID_SIZE) break
    if (count >= 2) finestFitting = unitInterval
    if (count >= targetCount) break
  }
  if (!finestFitting) return undefined

  const [unit, interval] = finestFitting
  const inclusiveEnd = new Date(+end + 1)
  return { unit, values: interval.range(interval.ceil(start), inclusiveEnd) }
}

const getPhaseSubsetSize = (gridSize: number, step: number, phase: number): number =>
  phase < gridSize ? Math.floor((gridSize - 1 - phase) / step) + 1 : 0

const TIME_UNIT_CYCLES: Partial<Record<AxisTimeTickUnit, { length: number; getPosition: (date: Date) => number }>> = {
  [AxisTimeTickUnit.Second]: { length: 60, getPosition: date => date.getSeconds() },
  [AxisTimeTickUnit.Minute]: { length: 60, getPosition: date => date.getMinutes() },
  [AxisTimeTickUnit.Hour]: { length: 24, getPosition: date => date.getHours() },
  [AxisTimeTickUnit.Month]: { length: 12, getPosition: date => date.getMonth() },
}

/** Steps to try on a unit with a cycle: the cycle's divisors, then its whole multiples. */
function getCycleSnappedSteps (cycleLength: number, minStep: number, gridSize: number): number[] {
  const steps: number[] = []
  for (let step = 1; step <= cycleLength; step += 1) {
    if (cycleLength % step === 0) steps.push(step)
  }
  for (let step = cycleLength * 2; steps[steps.length - 1] < gridSize; step += cycleLength) steps.push(step)
  return steps.filter(step => step >= minStep)
}

const UNIFORM_TICK_COUNT_SLACK = 1.5
const UNIFORM_TICK_MARKS_PER_LABEL = 4

/** Densest uniform label placement over the base grid: every `step`-th value from some phase.
 * Steps snap to the unit's cycle where it has one, phases prefer cycle-aligned positions, and
 * the leftover grid values become unlabeled marks. */
export function findUniformFittingTickValues (
  gridValues: TickValues,
  maxNumTicks: number,
  getLabelRects: (values: TickValues) => Rect[],
  tolerance = 0,
  unit?: AxisTimeTickUnit
): TickSets | undefined {
  const gridSize = gridValues.length
  if (gridSize < 2) return undefined

  const maxNumLabels = Math.max(1, Math.ceil(maxNumTicks * UNIFORM_TICK_COUNT_SLACK))
  const maxNumMarks = Math.max(maxNumLabels, maxNumTicks * UNIFORM_TICK_MARKS_PER_LABEL)

  const getSubset = (step: number, phase: number): TickValues => {
    const subset: TickValues = []
    for (let i = phase; i < gridSize; i += step) subset.push(gridValues[i])
    return subset
  }

  const buildTickSets = (fitted: FittedTickValues, step: number, phase: number): TickSets => {
    let markStep = step
    for (let m = 1; m < step; m += 1) {
      if (step % m === 0 && Math.ceil(gridSize / m) <= maxNumMarks) { markStep = m; break }
    }
    const originalTicks = markStep === step
      ? fitted.fittedTicks
      : gridValues.filter((_, i) => (i - phase) % markStep === 0)
    return { ...fitted, originalTicks }
  }

  const gridRects = getLabelRects(gridValues)
  const centers = gridRects.map(rect => rect.x + rect.width / 2)
  let maxGridGap = 0
  for (let i = 1; i < gridSize; i += 1) maxGridGap = Math.max(maxGridGap, Math.abs(centers[i] - centers[i - 1]))
  const sortedWidths = gridRects.map(rect => rect.width).sort((a, b) => a - b)
  const narrowestPairWidth = (sortedWidths[0] + sortedWidths[1]) / 2
  const minStepByWidth = maxGridGap > 0 ? Math.ceil(narrowestPairWidth / maxGridGap) - 1 : 1
  const minStepByCount = Math.ceil(gridSize / maxNumLabels)
  const minStep = Math.min(gridSize, Math.max(1, minStepByWidth, minStepByCount))

  const cycle = unit && TIME_UNIT_CYCLES[unit]
  const steps = cycle
    ? getCycleSnappedSteps(cycle.length, minStep, gridSize)
    : Array.from({ length: gridSize - minStep + 1 }, (_, i) => minStep + i)

  for (const step of steps) {
    const alignedStep = cycle ? Math.min(step, cycle.length) : 1
    const isAligned = (phase: number): boolean =>
      !!cycle && cycle.getPosition(gridValues[phase] as Date) % alignedStep === 0

    const phases = Array.from({ length: Math.min(step, gridSize) }, (_, phase) => phase)
      .sort((a, b) =>
        Number(isAligned(b)) - Number(isAligned(a)) ||
        getPhaseSubsetSize(gridSize, step, b) - getPhaseSubsetSize(gridSize, step, a) ||
        a - b)

    const evaluated: { phase: number; subset: TickValues; rects: Rect[] }[] = []
    for (const phase of phases) {
      const subset = getSubset(step, phase)
      const rects = getLabelRects(subset)
      if (fitsWithoutOverlap(rects, tolerance)) {
        return buildTickSets({ fittedTicks: subset, labeledTicks: subset }, step, phase)
      }
      evaluated.push({ phase, subset, rects })
    }
    for (const { phase, subset, rects } of evaluated) {
      const fitted = dropCollidingExtremes(subset, rects, getLabelRects, tolerance)
      if (fitted) return buildTickSets(fitted, step, phase)
    }
  }

  return undefined
}
