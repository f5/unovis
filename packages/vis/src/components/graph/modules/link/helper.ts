// Copyright (c) Volterra, Inc. All rights reserved.

// Utils
import { getNumber, getString, getValue } from 'utils/data'
import { stringToHtmlId } from 'utils/misc'
import { getColor } from 'utils/color'

// Types
import { GraphInputLink, GraphInputNode } from 'types/graph'

// Local Types
import { GraphLink, GraphLinkArrow } from '../../types'

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

export function getLinkStrokeWidth (d: GraphLink, scale: number, config: GraphConfig<GraphInputNode, GraphInputLink>): number {
  const m = getNumber(d, config.linkWidth)
  return m / Math.pow(scale, 0.5)
}

export function getLinkBandWidth (d: GraphLink, scale: number, config: GraphConfig<GraphInputNode, GraphInputLink>): number {
  const { nodeSize, linkBandWidth } = config
  const sourceNodeSize = getNumber(d.source, nodeSize)
  const targetNodeSize = getNumber(d.target, nodeSize)
  const minNodeSize = Math.min(sourceNodeSize, targetNodeSize)
  return Math.min(minNodeSize, getNumber(d, linkBandWidth) / Math.pow(scale || 1, 0.5)) || 0
}

export function getLinkColor (link: GraphLink, config: GraphConfig<GraphInputNode, GraphInputLink>): string {
  const { linkStroke } = config
  const c = getColor(link, linkStroke) ?? 'var(--vis-graph-link-stroke-color)'
  return c || null
}

export function getMarker (d: GraphLink, scale: number, config: GraphConfig<GraphInputNode, GraphInputLink>): string {
  const { linkArrow } = config
  if ((scale > ZoomLevel.Level2) && getString(d, linkArrow)) {
    const color = getLinkColor(d, config)
    return `url(#${stringToHtmlId(color)}-${getValue<GraphLink, GraphLinkArrow>(d, linkArrow)})`
  } else {
    return null
  }
}

export function getArrowPath (): string {
  return `M0,0 V${LINK_MARKER_HEIGHT} L${LINK_MARKER_WIDTH},${LINK_MARKER_HEIGHT / 2} Z`
}

export function getDoubleArrowPath (): string {
  return `M0,${LINK_MARKER_HEIGHT / 2} L${LINK_MARKER_WIDTH},0 L${LINK_MARKER_WIDTH * 2},${LINK_MARKER_HEIGHT / 2} L${LINK_MARKER_WIDTH},${LINK_MARKER_HEIGHT} Z`
}
