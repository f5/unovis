import { select, Selection } from 'd3-selection'
import { color } from 'd3-color'
import L from 'leaflet'

// Types
import { Rect } from 'types/misc'

// Utils
import { smartTransition } from 'utils/d3'
import { estimateTextSize, trimTextMiddle } from 'utils/text'
import { clamp, getString } from 'utils/data'
import { rectIntersect } from 'utils/misc'
import { hexToBrightness } from 'utils/color'
import { getPointPos } from './utils'

// Local Types
import { LeafletMapPointDatum, LeafletMapClusterDatum, LeafletMapPoint, LeafletMapPointShape } from '../types'

// Modules
import { updateDonut } from './donut'

// Config
import { LeafletMapConfigInterface } from '../config'

import * as s from '../style'

const BOTTOM_LABEL_TOP_MARGIN = 10
const BOTTOM_LABEL_FONT_SIZE = 10

export function createNodes<D> (selection: Selection<SVGGElement, LeafletMapPoint<D>, SVGGElement, Record<string, unknown>[]>): void {
  selection.append('path')
    .attr('class', s.pointPath)
    .attr('id', d => `point-${d.id}`)
    .style('opacity', 0)

  selection.append('g')
    .attr('class', s.donutCluster)

  selection.append('text')
    .attr('class', s.innerLabel)
    .attr('id', d => `label-${d.id}`)
    .attr('dy', '0.32em')

  selection.append('text')
    .attr('class', s.bottomLabel)
    .attr('dy', '0.32em')
    .attr('opacity', 1)
}

export function updateNodes<D> (
  selection: Selection<SVGGElement, LeafletMapPoint<D>, SVGGElement, Record<string, unknown>[]>,
  config: LeafletMapConfigInterface<D>,
  leafletMap: L.Map,
  mapMoveZoomUpdateOnly: boolean
): void {
  selection.each((d: LeafletMapPoint<D>, i: number, elements: SVGGElement[]) => {
    const group = select(elements[i])
    const node: Selection<SVGPathElement, any, SVGGElement, any> = group.select(`.${s.pointPath}`)
    const innerLabel: Selection<SVGTextElement, any, SVGElement, any> = group.select(`.${s.innerLabel}`)
    const bottomLabel: Selection<SVGTextElement, any, SVGElement, any> = group.select(`.${s.bottomLabel}`)

    const { x, y } = getPointPos(d, leafletMap)
    const donutData = d.donutData
    const isCluster = (d.properties as LeafletMapClusterDatum<D>).cluster
    const fromExpandedCluster = !!(d.properties as LeafletMapPointDatum<D>).expandedClusterPoint

    const innerLabelText = getString(d.properties, isCluster ? config.clusterLabel : config.pointLabel) ?? ''
    const bottomLabelText = getString(d.properties, isCluster ? config.clusterBottomLabel : config.pointBottomLabel) ?? ''
    const pointCursor = getString(d.properties, config.pointCursor)
    const pointShape = getString(d.properties as LeafletMapPointDatum<D>, config.pointShape)
    const isRing = pointShape === LeafletMapPointShape.Ring
    const isCircular = (pointShape === LeafletMapPointShape.Circle) || isRing || isCluster || !pointShape

    // To get updated on every render call
    const ringWidth = (isCluster && config.clusterRingWidth) || (isRing && config.pointRingWidth) || 0
    group.attr('transform', `translate(${x},${y})`)
    group.select(`.${s.donutCluster}`)
      .call(updateDonut, donutData, isCircular ? d.radius : 0, ringWidth)

    node.attr('d', d.path)
    node.style('cursor', isCluster ? 'pointer' : pointCursor)
    bottomLabel.attr('transform', `translate(0,${d.radius + BOTTOM_LABEL_TOP_MARGIN})`)
    innerLabel.attr('font-size', () => {
      const fontSize = d.radius / Math.pow(innerLabelText.length, 0.4)
      return clamp(fontSize, fontSize, 16)
    })

    if (mapMoveZoomUpdateOnly) return

    // Updates required only when data changes
    node
      .classed(s.pointPathCluster, isCluster)
      .classed(s.pointPathRing, isRing)
      .style('fill', d.color)
      .style('stroke', d.color) // being used for hover
      .style('stroke-width', ringWidth)
      .style('opacity', 1)

    innerLabel
      .text(innerLabelText || null)
      .attr('visibility', innerLabelText ? null : 'hidden')
      .style('fill', () => {
        const c = getComputedStyle(node.node()).fill
        const hex = color(c)?.hex()
        if (!hex) return null

        const brightness = hexToBrightness(hex)
        return brightness > 0.5 ? 'var(--vis-map-point-label-text-color-dark)' : 'var(--vis-map-point-label-text-color-light)'
      })

    const bottomLabelTextTrimmed = trimTextMiddle(bottomLabelText, 15)
    bottomLabel
      .text(bottomLabelTextTrimmed)
      .attr('font-size', BOTTOM_LABEL_FONT_SIZE)
      .attr('visibility', fromExpandedCluster ? 'hidden' : null)
  })
}

export function collideLabels<D> (
  selection: Selection<SVGGElement, LeafletMapPoint<D>, SVGGElement, Record<string, unknown>[]>,
  leafletMap: L.Map
): void {
  selection.each((datum1: LeafletMapPoint<D>, i, elements) => {
    const group1HTMLNode = elements[i]
    const group1 = select(group1HTMLNode)
    const label1: Selection<SVGTextElement, any, SVGElement, any> = group1.select(`.${s.bottomLabel}`)
    // eslint-disable-next-line dot-notation
    group1HTMLNode['labelVisible'] = true

    // Calculate bounding rect of point's bottom label
    const p1Pos = getPointPos(datum1, leafletMap)
    const label1Size = estimateTextSize(label1, BOTTOM_LABEL_FONT_SIZE, 0.32, true, 0.6)
    const label1BoundingRect: Rect = {
      x: p1Pos.x - label1Size.width / 2,
      y: p1Pos.y - label1Size.height / 2 + datum1.radius + BOTTOM_LABEL_TOP_MARGIN,
      width: label1Size.width,
      height: label1Size.height,
    }

    for (let j = 0; j < elements.length; j += 1) {
      if (i === j) continue
      const group2HTMLNode = elements[j]
      const group2 = select(group2HTMLNode)
      const label2: Selection<SVGTextElement, any, SVGElement, any> = group2.select(`.${s.bottomLabel}`)
      const datum2 = group2.datum() as LeafletMapPoint<D>

      // Calculate bounding rect of the second point's circle
      const p2Pos = getPointPos(datum2, leafletMap)
      const point2BoundingRect = {
        x: p2Pos.x - datum2.radius,
        y: p2Pos.y - datum2.radius,
        width: 2 * datum2.radius,
        height: 2 * datum2.radius,
      }

      let intersect = rectIntersect(label1BoundingRect, point2BoundingRect)

      // If there's not intersection, check a collision with the second point's label
      // eslint-disable-next-line dot-notation
      const label2Visible = group2HTMLNode['labelVisible']
      if (!intersect && label2Visible) {
        const label2Size = estimateTextSize(label2, BOTTOM_LABEL_FONT_SIZE, 0.32, true, 0.6)
        intersect = rectIntersect(label1BoundingRect, {
          x: p2Pos.x - label2Size.width / 2,
          y: p2Pos.y + datum2.radius + BOTTOM_LABEL_TOP_MARGIN - label2Size.height / 2,
          width: label2Size.width,
          height: label2Size.height,
        })
      }

      if (intersect) {
        // eslint-disable-next-line dot-notation
        group1HTMLNode['labelVisible'] = false
        break
      }
    }

    // eslint-disable-next-line dot-notation
    smartTransition(label1, 0).attr('opacity', group1HTMLNode['labelVisible'] ? 1 : 0)
  })
}

export function removeNodes<D> (selection: Selection<SVGGElement, LeafletMapPoint<D>, SVGGElement, Record<string, unknown>[]>): void {
  selection.remove()
}
