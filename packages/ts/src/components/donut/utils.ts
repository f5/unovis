import { PieArcDatum } from 'd3-shape'

/** Inflates positive-value arcs whose sweep is smaller than `minSegmentAngle`,
 * taking the difference proportionally from the remaining positive arcs.
 * Mutates the arc angles in place; input values stay untouched. */
export function applyMinSegmentAngle<Datum> (
  arcs: PieArcDatum<Datum>[],
  minSegmentAngle: number,
  angleRange: [number, number]
): void {
  if (!arcs.length) return

  // d3's pie gives every arc an extra `padAngle` of sweep on top of its
  // value-proportional share, so the redistribution operates on the
  // pad-free ("content") part of each sweep
  const padAngle = arcs[0].padAngle
  const totalAngle = angleRange[1] - angleRange[0]
  const contentAngle = totalAngle - arcs.length * padAngle
  const minContentAngle = minSegmentAngle - padAngle
  if (contentAngle <= 0 || minContentAngle <= 0) return

  const positiveArcs = arcs.filter(arc => arc.value > 0)
  const getRemainingValue = (inflated: Set<PieArcDatum<Datum>>): number =>
    positiveArcs.reduce((sum, arc) => inflated.has(arc) ? sum : sum + arc.value, 0)

  // Settle the set of inflated arcs iteratively: inflating one arc shrinks
  // the rest, which can push more arcs below the threshold. The set only
  // grows, so the loop is bounded by the number of positive arcs
  const inflated = new Set<PieArcDatum<Datum>>()
  let hasChanged = true
  while (hasChanged) {
    hasChanged = false
    const availableAngle = contentAngle - inflated.size * minContentAngle
    const remainingValue = getRemainingValue(inflated)
    for (const arc of positiveArcs) {
      if (inflated.has(arc)) continue
      const contentSweep = remainingValue > 0 ? availableAngle * arc.value / remainingValue : 0
      if (contentSweep < minContentAngle) {
        inflated.add(arc)
        hasChanged = true
      }
    }
  }
  if (!inflated.size) return

  // When the combined minimum exceeds the available range, scale the minimum
  // down so the total still spans the range instead of overflowing it
  const inflatedContentSweep = Math.min(minContentAngle, contentAngle / inflated.size)
  const availableAngle = contentAngle - inflated.size * inflatedContentSweep
  const remainingValue = getRemainingValue(inflated)

  // Reassign the angles cumulatively, preserving the angular order of the layout
  const orderedArcs = [...arcs].sort((a, b) => a.startAngle - b.startAngle)
  let currentAngle = angleRange[0]
  for (const arc of orderedArcs) {
    const contentSweep = inflated.has(arc)
      ? inflatedContentSweep
      : (arc.value > 0 ? availableAngle * arc.value / remainingValue : 0)
    arc.startAngle = currentAngle
    arc.endAngle = currentAngle + contentSweep + padAngle
    currentAngle = arc.endAngle
  }
}
