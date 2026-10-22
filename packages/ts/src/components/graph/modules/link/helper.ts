// Utils
import { getNumber, getValue } from '@/utils/data'
import { getColor, hexToBrightness } from '@/utils/color'
import { color } from 'd3-color'

// Types
import { GraphInputLink, GraphInputNode } from '@/types/graph'

// Local Types
import { GraphLink, GraphLinkArrowStyle, GraphCircleLabel } from '../../types'

// Config
import { GraphConfigInterface } from '../../config'

// Helpers
import { getX, getY } from '../node/helper'

export const getPolylineData = (d: { x1: number; x2: number; y1: number; y2: number}): string => `${d.x1},${d.y1} ${(d.x1 + d.x2) / 2},${(d.y1 + d.y2) / 2} ${d.x2},${d.y2}`

/** Returns the full point sequence (from source to target) for a smooth-step link, assuming a fixed routing
 * along the given `axis` (`'y'` = vertical, `'x'` = horizontal) and `direction` (`1` = source leaves going
 * down/right, `-1` = up/left), so the shape still reads as source -> target even when a node ends up on the
 * "wrong" side. Matches xyflow's default smoothstep routing:
 * https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/smoothstep-edge.ts */
export function getSmoothStepPoints (x1: number, y1: number, x2: number, y2: number, offset: number, axis: 'x' | 'y' = 'y', direction: 1 | -1 = 1): [number, number][] {
  const [p1, q1] = axis === 'y' ? [y1, x1] : [x1, y1]
  const [p2, q2] = axis === 'y' ? [y2, x2] : [x2, y2]
  const toPoint = (p: number, q: number): [number, number] => axis === 'y' ? [q, p] : [p, q]

  const sourceGappedP = p1 + offset * direction
  const targetGappedP = p2 - offset * direction
  const isSourceOnExitSide = direction > 0 ? p1 < p2 : p1 > p2
  const centerQ = (q1 + q2) / 2
  const centerP = (sourceGappedP + targetGappedP) / 2

  const bend: [number, number][] = isSourceOnExitSide
    ? [toPoint(centerP, q1), toPoint(centerP, q2)]
    : [toPoint(sourceGappedP, centerQ), toPoint(targetGappedP, centerQ)]

  return [toPoint(p1, q1), toPoint(sourceGappedP, q1), ...bend, toPoint(targetGappedP, q2), toPoint(p2, q2)]
}

// Rounds the corner at `b` with a quadratic curve of up to `size` px, adapted from xyflow's `getBend`:
// https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/smoothstep-edge.ts
function getSmoothStepBend (a: [number, number], b: [number, number], c: [number, number], size: number): string {
  const distance = (p1: [number, number], p2: [number, number]): number => Math.hypot(p2[0] - p1[0], p2[1] - p1[1])
  const bendSize = Math.min(distance(a, b) / 2, distance(b, c) / 2, size)
  const [x, y] = b

  if (((a[0] === x) && (x === c[0])) || ((a[1] === y) && (y === c[1]))) return `L${x},${y}`

  if (a[1] === y) {
    const xDir = a[0] < c[0] ? -1 : 1
    const yDir = a[1] < c[1] ? 1 : -1
    return `L${x + bendSize * xDir},${y} Q${x},${y} ${x},${y + bendSize * yDir}`
  }

  const xDir = a[0] < c[0] ? 1 : -1
  const yDir = a[1] < c[1] ? -1 : 1
  return `L${x},${y + bendSize * yDir} Q${x},${y} ${x + bendSize * xDir},${y}`
}

/** Builds an SVG path that connects `points` with right-angle steps and rounds the interior corners by up to
 * `borderRadius` pixels, adapted from xyflow's `getSmoothStepPath`:
 * https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/smoothstep-edge.ts */
export function getSmoothStepPathData (points: [number, number][], borderRadius: number): string {
  const pts = points.filter((p, i) => (i === 0) || (p[0] !== points[i - 1][0]) || (p[1] !== points[i - 1][1]))
  let path = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 1; i < pts.length - 1; i++) {
    path += getSmoothStepBend(pts[i - 1], pts[i], pts[i + 1], borderRadius)
  }
  path += ` L${pts[pts.length - 1][0]},${pts[pts.length - 1][1]}`
  return path
}

export const LINK_MARKER_WIDTH = 9
export const LINK_MARKER_HEIGHT = 7

export function getLinkShift (link: GraphLink, spacing: number): { dx: number; dy: number } {
  const sourceNode = link.source
  const targetNode = link.target
  const angle = Math.atan2(getY(targetNode) - getY(sourceNode), getX(targetNode) - getX(sourceNode)) - Math.PI / 2
  const dx = Math.cos(angle) * spacing * link._direction * (link._index - (link._neighbours - 1) / 2)
  const dy = Math.sin(angle) * spacing * link._direction * (link._index - (link._neighbours - 1) / 2)
  return { dx, dy }
}

export function getLinkShiftTransform (link: GraphLink, spacing: number): string {
  const { dx, dy } = getLinkShift(link, spacing)
  return `translate(${dx}, ${dy})`
}

export function getLinkStrokeWidth<N extends GraphInputNode, L extends GraphInputLink> (
  d: GraphLink<N, L>,
  scale: number,
  config: GraphConfigInterface<N, L>
): number {
  const m = getNumber(d, config.linkWidth, d._indexGlobal)
  return m / Math.pow(scale, 0.5)
}

export function getLinkBandWidth<N extends GraphInputNode, L extends GraphInputLink> (
  d: GraphLink<N, L>,
  scale: number,
  config: GraphConfigInterface<N, L>
): number {
  const { nodeSize, linkBandWidth } = config
  const sourceNodeSize = getNumber(d.source, nodeSize, d.source._index)
  const targetNodeSize = getNumber(d.target, nodeSize, d.target._index)
  const minNodeSize = Math.min(sourceNodeSize, targetNodeSize)
  return Math.min(minNodeSize, getNumber(d, linkBandWidth, d._indexGlobal) / Math.pow(scale || 1, 0.5)) || 0
}

export function getLinkColor<N extends GraphInputNode, L extends GraphInputLink> (link: GraphLink<N, L>, config: GraphConfigInterface<N, L>): string {
  const { linkStroke } = config
  const c = getColor(link, linkStroke, link._indexGlobal, undefined, { dontFallbackToCssVar: true }) ?? 'var(--vis-graph-link-stroke-color)'
  return c || null
}

export function getLinkArrowStyle<N extends GraphInputNode, L extends GraphInputLink> (
  d: GraphLink<N, L>,
  config: GraphConfigInterface<N, L>
): GraphLinkArrowStyle | undefined {
  const linkArrowValue = getValue<GraphLink<N, L>, GraphLinkArrowStyle | string | boolean>(d, config.linkArrow, d._indexGlobal)

  if (!linkArrowValue) return undefined
  else if (linkArrowValue === GraphLinkArrowStyle.Double) return linkArrowValue as GraphLinkArrowStyle.Double
  else return GraphLinkArrowStyle.Single
}

export function getArrowPath (): string {
  return `M${-LINK_MARKER_WIDTH / 2},${-LINK_MARKER_HEIGHT / 2} V${LINK_MARKER_HEIGHT / 2} L${LINK_MARKER_WIDTH / 2},0 Z`
}

export function getDoubleArrowPath (): string {
  return `M${-LINK_MARKER_WIDTH / 2},0 L${LINK_MARKER_WIDTH / 2},${-LINK_MARKER_HEIGHT / 2} L${LINK_MARKER_WIDTH * 1.5},0 L${LINK_MARKER_WIDTH / 2},${LINK_MARKER_HEIGHT / 2} Z`
}

export function getLinkLabelTextColor (label: GraphCircleLabel): string {
  if (!label.color) return null

  const hex = color(label.color).hex()
  const brightness = hexToBrightness(hex)
  return brightness > 0.65 ? 'var(--vis-graph-link-label-text-color-dark)' : 'var(--vis-graph-link-label-text-color-bright)'
}
