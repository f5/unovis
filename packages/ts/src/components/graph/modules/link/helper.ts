// Utils
import { getNumber, getString, getValue } from 'utils/data'
import { getColor, hexToBrightness } from 'utils/color'
import { color } from 'd3-color'

// Types
import { GraphInputLink, GraphInputNode } from 'types/graph'

// Local Types
import { GraphLink, GraphLinkArrowStyle, GraphCircleLabel } from '../../types'

// Config
import { GraphConfig } from '../../config'

// Helpers
import { getX, getY } from '../node/helper'
import { ZoomLevel } from '../zoom-levels'

export const getPolylineData = (d: { x1: number; x2: number; y1: number; y2: number}): string => `${d.x1},${d.y1} ${(d.x1 + d.x2) / 2},${(d.y1 + d.y2) / 2} ${d.x2},${d.y2}`

export const LINK_LABEL_RADIUS = 8
export const LINK_MARKER_WIDTH = 12
export const LINK_MARKER_HEIGHT = 8

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

export function getLinkLabelShift (link: GraphLink, linkSpacing: number, shiftFromCenter = 0): string {
  const x1 = getX(link.source)
  const y1 = getY(link.source)
  const x2 = getX(link.target)
  const y2 = getY(link.target)
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const perpendicularShift = getLinkShift(link, linkSpacing)

  const x = x1 + 0.5 * (x2 - x1) + shiftFromCenter * Math.cos(angle) + perpendicularShift.dx
  const y = y1 + 0.5 * (y2 - y1) + shiftFromCenter * Math.sin(angle) + perpendicularShift.dy
  return `translate(${x}, ${y})`
}

export function getLinkStrokeWidth<N extends GraphInputNode, L extends GraphInputLink> (
  d: GraphLink,
  scale: number,
  config: GraphConfig<N, L>
): number {
  const m = getNumber(d, config.linkWidth, d._indexGlobal)
  return m / Math.pow(scale, 0.5)
}

export function getLinkBandWidth<N extends GraphInputNode, L extends GraphInputLink> (
  d: GraphLink,
  scale: number,
  config: GraphConfig<N, L>
): number {
  const { nodeSize, linkBandWidth } = config
  const sourceNodeSize = getNumber(d.source, nodeSize, d.source._index)
  const targetNodeSize = getNumber(d.target, nodeSize, d.target._index)
  const minNodeSize = Math.min(sourceNodeSize, targetNodeSize)
  return Math.min(minNodeSize, getNumber(d, linkBandWidth, d._indexGlobal) / Math.pow(scale || 1, 0.5)) || 0
}

export function getLinkColor<N extends GraphInputNode, L extends GraphInputLink> (link: GraphLink, config: GraphConfig<N, L>): string {
  const { linkStroke } = config
  const c = getColor(link, linkStroke, link._indexGlobal, true) ?? 'var(--vis-graph-link-stroke-color)'
  return c || null
}

export function getLinkArrow<N extends GraphInputNode, L extends GraphInputLink> (
  d: GraphLink,
  scale: number,
  config: GraphConfig<N, L>
): string {
  const { linkArrow } = config
  if (scale > ZoomLevel.Level2 && getString(d, linkArrow, d._indexGlobal)) {
    return getValue<GraphLink, GraphLinkArrowStyle>(d, linkArrow, d._indexGlobal)
  }
  return null
}

export function getArrowPath (): string {
  return `M0,0 V${LINK_MARKER_HEIGHT} L${LINK_MARKER_WIDTH},${LINK_MARKER_HEIGHT / 2} Z`
}

export function getDoubleArrowPath (): string {
  return `M0,${LINK_MARKER_HEIGHT / 2} L${LINK_MARKER_WIDTH},0 L${LINK_MARKER_WIDTH * 2},${LINK_MARKER_HEIGHT / 2} L${LINK_MARKER_WIDTH},${LINK_MARKER_HEIGHT} Z`
}

export function getLinkLabelTextColor (label: GraphCircleLabel): string {
  if (!label.color) return null

  const hex = color(label.color).hex()
  const brightness = hexToBrightness(hex)
  return brightness > 0.65 ? 'var(--vis-graph-link-label-text-color-dark)' : 'var(--vis-graph-link-label-text-color-bright)'
}
