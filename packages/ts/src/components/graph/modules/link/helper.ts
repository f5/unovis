// Utils
import { getNumber, getValue } from 'utils/data'
import { getColor, hexToBrightness } from 'utils/color'
import { color } from 'd3-color'

// Types
import { GraphInputLink, GraphInputNode } from 'types/graph'

// Local Types
import { GraphLink, GraphLinkArrowStyle, GraphCircleLabel } from '../../types'

// Config
import { GraphConfigInterface } from '../../config'

// Helpers
import { getX, getY } from '../node/helper'

export const getPolylineData = (d: { x1: number; x2: number; y1: number; y2: number}): string => `${d.x1},${d.y1} ${(d.x1 + d.x2) / 2},${(d.y1 + d.y2) / 2} ${d.x2},${d.y2}`

export const LINK_LABEL_RADIUS = 8
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
  const c = getColor(link, linkStroke, link._indexGlobal, true) ?? 'var(--vis-graph-link-stroke-color)'
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
