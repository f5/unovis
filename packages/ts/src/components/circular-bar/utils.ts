import { arc } from 'd3-shape'

// Utils
import { clamp } from '@/utils/data'

// Local Types
import { CircularBarPetalGeometry } from './types'

// Constants
import { CIRCULAR_BAR_EPSILON, CIRCULAR_BAR_DEFAULT_TIP_ROUNDING_RATIO } from './constants'

/**
 * Resolves the corner radii of a bar so that they fit into the bar, and finds the radius the bar starts at.
 *
 * A bar is the sector between `startAngle` and `endAngle` with both sides moved towards the middle by
 * `halfPadding`, so that neighbouring bars are separated by a gap of a constant width. The two outer corners are
 * rounded with `cornerRadius`. The inner side is either an arc of `innerRadius` with two corners rounded with
 * `innerCornerRadius`, or, when the sides meet before reaching `innerRadius`, a single rounded tip of
 * `innerCornerRadius`. A bar is cut at its outer radius: a short bar with a tip is the same tip circle cut by
 * the outer arc, and a short bar with an inner arc is a band with corners no larger than half of its thickness.
 *
 * All the math is done in the local frame of the bar, where the bisector points outward from the center.
 * A corner circle tangent to a side and to a circle of radius `r` around the center has its center at
 * `r ∓ corner` from the center and at `halfPadding + corner` from the side line, which lets us express
 * every tangent point in closed form.
 *
 * Returns `undefined` when the bar has no width at its outer edge or doesn't reach beyond its base.
 */
export function getPetalGeometry (
  halfAngle: number,
  innerRadius: number,
  outerRadius: number,
  halfPadding: number,
  cornerRadius: number,
  innerCornerRadius: number
): CircularBarPetalGeometry | undefined {
  const sinA = Math.sin(halfAngle)
  const tanA = Math.tan(halfAngle)
  const r0 = Math.max(0, innerRadius)
  const r1 = outerRadius
  const p = Math.max(0, halfPadding)

  // The sides meet beyond the outer edge: the bar has no width
  if (r1 * sinA - p <= CIRCULAR_BAR_EPSILON) return undefined

  // The two outer corners must not overlap
  const maxCornerRadius = (r1 * sinA - p) / (1 + sinA)
  let rc = clamp(cornerRadius, 0, maxCornerRadius)
  let rt = Math.max(0, innerCornerRadius)

  // Position of the sharp outer corner along the side line
  const outerSharp = Math.sqrt(r1 * r1 - p * p)

  // The inner corners merge into a rounded tip when the tip circle is closer to the center than `innerRadius`.
  // The default inner corner radius puts the tip exactly on `innerRadius`, so the comparison needs a tolerance,
  // otherwise floating-point rounding would pick the shape
  const tipRadius = (p + rt) / sinA - rt

  if (r0 <= tipRadius + CIRCULAR_BAR_EPSILON * Math.max(1, r0)) {
    if (r1 <= tipRadius + CIRCULAR_BAR_EPSILON) return undefined

    // The outer corners must not be larger than a third of the bar's length. When a short bar is cut by the outer
    // arc, larger corners would slide towards the bisector and merge into a single circle (at half the length),
    // leaving the bar much narrower than its slot
    rc = Math.min(rc, (r1 - tipRadius) / 3)

    // Where the outer corner touches the side, and where the tip circle touches it, both along the side line.
    // When the corner would touch the side beyond the tip, the bar has no straight sides: the outer arc cuts the
    // tip circle and the corners are rounded between the two circles instead (see `getPetalPath`)
    const cornerCenterRadius = r1 - rc
    const outerTangent = Math.sqrt(Math.max(0, cornerCenterRadius * cornerCenterRadius - (p + rc) * (p + rc)))
    const tipTangent = (p + rt) / tanA
    const isClipped = outerTangent < tipTangent

    return { cornerRadius: rc, innerCornerRadius: rt, baseRadius: tipRadius, hasTip: true, isClipped }
  }

  if (r1 <= r0 + CIRCULAR_BAR_EPSILON) return undefined

  // The corner circles must fit into the radial thickness of the bar, otherwise they bulge past its ends
  const maxRadialCornerRadius = (r1 - r0) / 2
  rc = Math.min(rc, maxRadialCornerRadius)
  rt = Math.min(rt, maxRadialCornerRadius)

  // Position of the sharp inner corner along the side line
  const innerSharp = Math.sqrt(Math.max(0, r0 * r0 - p * p))
  // Both roundings meet exactly when sqrt(innerSharp² + k·innerCornerSpan) = sqrt(outerSharp² − k·outerCornerSpan)
  const innerCornerSpan = 2 * rt * (r0 - p)
  const outerCornerSpan = 2 * rc * (r1 + p)
  const span = innerCornerSpan + outerCornerSpan
  if (span > CIRCULAR_BAR_EPSILON) {
    const k = (outerSharp * outerSharp - innerSharp * innerSharp) / span
    if (k < 1) {
      rc *= Math.max(0, k)
      rt *= Math.max(0, k)
    }
  }

  return { cornerRadius: rc, innerCornerRadius: rt, baseRadius: r0, hasTip: false, isClipped: false }
}

/**
 * Inner corner radius at which the two inner corners of a bar merge into a single rounded tip that just touches
 * `innerRadius`. With smaller radii a piece of the inner circle remains between the two corners, which reads as
 * two lobes when the bar is wide. The radius is capped so that the bar's straight sides keep a positive length
 * next to the outer corners. Returns `0` when the bar has no room for a tip (e.g. `innerRadius` is `0`).
 */
export function getPetalTipCornerRadius (
  halfAngle: number,
  innerRadius: number,
  outerRadius: number,
  padding: number,
  cornerRadius: number
): number {
  const sinA = Math.sin(halfAngle)
  const r0 = Math.max(0, innerRadius)
  const r1 = outerRadius
  const p = Math.max(0, padding) / 2
  if (halfAngle >= Math.PI / 2 - CIRCULAR_BAR_EPSILON || sinA >= 1 - CIRCULAR_BAR_EPSILON) return 0
  if (r0 * sinA - p <= CIRCULAR_BAR_EPSILON || r0 - p <= CIRCULAR_BAR_EPSILON) return 0

  // The tip circle touches `r0` when `(p + rt) / sinA - rt === r0`
  const tipCornerRadius = (r0 * sinA - p) / (1 - sinA)
  // Largest inner corner radius that still leaves room for the outer corners along the side (see `getPetalGeometry`,
  // which reduces oversized outer corners the same way)
  const rc = clamp(cornerRadius, 0, Math.max(0, (r1 * sinA - p) / (1 + sinA)))
  const outerSharpSq = r1 * r1 - p * p
  const innerSharpSq = r0 * r0 - p * p
  const maxCornerRadius = (outerSharpSq - innerSharpSq - 2 * rc * (r1 + p)) / (2 * (r0 - p))
  return clamp(Math.min(tipCornerRadius, maxCornerRadius), 0, r1)
}

/**
 * Default inner corner radius of a bar: the inner corners merge into a single rounded tip touching `innerRadius`
 * (see `getPetalTipCornerRadius`), with at least a fraction of the largest corner radius that fits into the outer end
 * of the bar, so that the rounding scales with the bar's width. When that minimum wins (a small `innerRadius`, e.g. `0`,
 * or very narrow bars), the tip starts slightly beyond `innerRadius`. Taking the maximum keeps the shape continuous
 * while `innerRadius` or the number of bars changes. Bars too wide for a tip keep two corners and a short inner arc.
 */
export function getPetalDefaultInnerCornerRadius (
  halfAngle: number,
  innerRadius: number,
  outerRadius: number,
  padding: number,
  cornerRadius: number
): number {
  const sinA = halfAngle >= Math.PI / 2 ? 1 : Math.sin(halfAngle)
  const p = Math.max(0, padding) / 2
  const maxFittingCornerRadius = Math.max(0, (outerRadius * sinA - p) / (1 + sinA))
  return Math.max(
    getPetalTipCornerRadius(halfAngle, innerRadius, outerRadius, padding, cornerRadius),
    maxFittingCornerRadius * CIRCULAR_BAR_DEFAULT_TIP_ROUNDING_RATIO
  )
}

/**
 * Distance from the center of the chart to the closest point on a bar's bisector where a circle of `clearance` radius
 * fits into the bar: past the bar's inner end (`baseRadius`) and far enough from both of its padded sides.
 * Used to place icons at the inner end of the bars.
 */
export function getPetalInnerAnchorRadius (
  halfAngle: number,
  baseRadius: number,
  padding: number,
  clearance: number
): number {
  // Sectors of 180° and more (the arc fallback) have sides that don't converge towards the bisector
  const sinA = halfAngle >= Math.PI / 2 ? 1 : Math.sin(halfAngle)
  const p = Math.max(0, padding) / 2
  // A bar without width can't fit anything; the radius stays finite so that icon transitions can interpolate from it
  if (sinA <= CIRCULAR_BAR_EPSILON) return baseRadius + clearance
  return Math.max(baseRadius + clearance, (clearance + p) / sinA)
}

/** Radius at which a bar of the provided geometry starts (its rounded tip or its inner edge) */
export function getPetalBaseRadius (
  halfAngle: number,
  innerRadius: number,
  outerRadius: number,
  padding: number,
  cornerRadius: number,
  innerCornerRadius: number
): number {
  if (halfAngle >= Math.PI / 2 - CIRCULAR_BAR_EPSILON) return Math.max(0, innerRadius)
  return getPetalGeometry(halfAngle, innerRadius, outerRadius, padding / 2, cornerRadius, innerCornerRadius)?.baseRadius ?? Math.max(0, innerRadius)
}

/**
 * Generates the SVG path of a petal-shaped bar: a sector with sides separated from its neighbours by a
 * gap of constant width, rounded outer corners and either rounded inner corners or a rounded tip.
 * See `getPetalGeometry` for details.
 */
export function getPetalPath (
  startAngle: number,
  endAngle: number,
  innerRadius: number,
  outerRadius: number,
  padding: number,
  cornerRadius: number,
  innerCornerRadius: number
): string {
  const a0 = Math.min(startAngle, endAngle)
  const a1 = Math.max(startAngle, endAngle)
  const halfAngle = (a1 - a0) / 2
  const midAngle = (a0 + a1) / 2
  const r0 = Math.max(0, innerRadius)
  const r1 = outerRadius
  const p = Math.max(0, padding) / 2
  if (halfAngle <= CIRCULAR_BAR_EPSILON || r1 <= r0 + CIRCULAR_BAR_EPSILON) return ''

  // At 180° and more the padded sides of a bar never meet, so the petal construction doesn't apply. Fall back to a regular arc
  if (halfAngle >= Math.PI / 2 - CIRCULAR_BAR_EPSILON) {
    const padAngle = 2 * Math.asin(clamp(p / Math.sqrt(r0 * r0 + r1 * r1), 0, 1))
    return arc()
      .cornerRadius(cornerRadius)
      .padAngle(padAngle)({ startAngle: a0, endAngle: a1, innerRadius: r0, outerRadius: r1 }) ?? ''
  }

  const geometry = getPetalGeometry(halfAngle, r0, r1, p, cornerRadius, innerCornerRadius)
  if (!geometry) return ''
  const { cornerRadius: rc, innerCornerRadius: rt, baseRadius: rb, hasTip, isClipped } = geometry

  const sinA = Math.sin(halfAngle)
  const cosA = Math.cos(halfAngle)
  const sinM = Math.sin(midAngle)
  const cosM = Math.cos(midAngle)

  // Converts a point from the bar's local frame (x: along the sweep, y: outward along the bisector) to SVG coordinates
  const point = (x: number, y: number): string => `${x * cosM + y * sinM},${x * sinM - y * cosM}`

  if (hasTip && isClipped) {
    // No straight sides: the outer arc cuts the tip circle. The corner circles are tangent to both, so their
    // centers lie on the circle of `r1 - rc` around the center and the circle of `rt - rc` around the tip center
    const tipCenterY = (p + rt) / sinA
    const outerCircle = r1 - rc
    const tipCircle = rt - rc
    const cornerY = (outerCircle * outerCircle - tipCircle * tipCircle + tipCenterY * tipCenterY) / (2 * tipCenterY)
    const cornerX = Math.sqrt(Math.max(0, outerCircle * outerCircle - cornerY * cornerY))
    const outerArcX = cornerX * r1 / outerCircle
    const outerArcY = cornerY * r1 / outerCircle
    const tipScale = tipCircle > CIRCULAR_BAR_EPSILON ? rt / tipCircle : 1
    const tipArcX = cornerX * tipScale
    const tipArcY = tipCenterY + (cornerY - tipCenterY) * tipScale

    return `M${point(-tipArcX, tipArcY)}` +
      `A${rc},${rc} 0 0 1 ${point(-outerArcX, outerArcY)}` +
      `A${r1},${r1} 0 0 1 ${point(outerArcX, outerArcY)}` +
      `A${rc},${rc} 0 0 1 ${point(tipArcX, tipArcY)}` +
      `A${rt},${rt} 0 0 1 ${point(-tipArcX, tipArcY)}Z`
  }

  // Outer corners: the corner circle centers sit on the circle of `r1 - rc` at `±psiOuter` from the bisector
  const psiOuter = halfAngle - Math.asin((p + rc) / (r1 - rc))
  const cOuter = r1 - rc
  const outerX = cOuter * Math.sin(psiOuter) + rc * cosA
  const outerY = cOuter * Math.cos(psiOuter) - rc * sinA
  const outerArcX = r1 * Math.sin(psiOuter)
  const outerArcY = r1 * Math.cos(psiOuter)

  let path = `M${point(-outerX, outerY)}` +
    `A${rc},${rc} 0 0 1 ${point(-outerArcX, outerArcY)}` +
    `A${r1},${r1} 0 0 1 ${point(outerArcX, outerArcY)}` +
    `A${rc},${rc} 0 0 1 ${point(outerX, outerY)}`

  if (hasTip) {
    // The tip circle center sits on the bisector, `p + rt` away from both sides
    const tipCenterY = (p + rt) / sinA
    const tipX = rt * cosA
    const tipY = tipCenterY - rt * sinA
    path += `L${point(tipX, tipY)}A${rt},${rt} 0 0 1 ${point(-tipX, tipY)}Z`
  } else {
    // Inner corners: the corner circle centers sit on the circle of `rb + rt` at `±psiInner` from the bisector
    const psiInner = halfAngle - Math.asin(Math.min(1, (p + rt) / (rb + rt)))
    const cInner = rb + rt
    const innerX = cInner * Math.sin(psiInner) + rt * cosA
    const innerY = cInner * Math.cos(psiInner) - rt * sinA
    const innerArcX = rb * Math.sin(psiInner)
    const innerArcY = rb * Math.cos(psiInner)
    path += `L${point(innerX, innerY)}` +
      `A${rt},${rt} 0 0 1 ${point(innerArcX, innerArcY)}` +
      `A${rb},${rb} 0 0 0 ${point(-innerArcX, innerArcY)}` +
      `A${rt},${rt} 0 0 1 ${point(-innerX, innerY)}Z`
  }

  return path
}
