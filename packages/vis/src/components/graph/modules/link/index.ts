// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'
import { Transition } from 'd3-transition'

// Types
import { NodeDatumCore, LinkDatumCore, LinkStyle } from 'types/graph'

// Utils
import { range, throttle, getValue } from 'utils/data'
import { smartTransition } from 'utils/d3'

// Config
import { GraphConfigInterface } from '../../config'

// Helpers
import { getX, getY, getSideTexLabelColor } from '../node/helper'
import { getPolylineData, getLinkShiftTransform, getLinkLabelShift, getLinkStrokeWidth, getLinkBandWidth, getMarker, getLinkColor, LINK_LABEL_RADIUS, LINK_MARKER_WIDTH } from './helper'
import ZOOM_LEVEL from '../zoom-levels'

// Styles
import * as generalSelectors from '../../style'
import * as linkSelectors from './style'

export function createLinks<N extends NodeDatumCore, L extends LinkDatumCore> (selection: Selection<SVGGElement, L, SVGGElement, L[]>): void {
  selection.attr('opacity', 0)

  selection.append('line')
    .attr('class', linkSelectors.linkSupport)

  selection.append('polyline')
    .attr('class', linkSelectors.link)

  selection.append('line')
    .attr('class', linkSelectors.linkBand)
    .attr('x1', d => getX(d.source as N))
    .attr('y1', d => getY(d.source as N))
    .attr('x2', d => getX(d.target as N))
    .attr('y2', d => getY(d.target as N))

  selection.append('g')
    .attr('class', linkSelectors.flowGroup)
    .selectAll(`.${linkSelectors.flowCircle}`)
    .data(range(6)).enter()
    .append('circle')
    .attr('class', linkSelectors.flowCircle)

  selection.append('g')
    .attr('class', linkSelectors.labelGroups)
}

export function updateSelectedLinks<N extends NodeDatumCore, L extends LinkDatumCore> (selection: Selection<SVGGElement, L, SVGGElement, L[]>, config: GraphConfigInterface<N, L>, scale: number): void {
  const isGreyout = d => d._state.greyout

  selection.select(`.${linkSelectors.link}`)
  selection.select(`.${linkSelectors.linkBand}`)
  selection.select(`.${linkSelectors.linkSupport}`)
    .style('stroke-opacity', d => (d._state.hovered || d._state.selected) ? 0.2 : 0)
    .style('stroke-width', d => {
      return d._state.selected ? getLinkBandWidth(d, scale, config) + 5
        : d._state.hovered ? getLinkBandWidth(d, scale, config) + 10 : null
    })

  selection
    .classed(linkSelectors.greyout, d => isGreyout(d))
}

export function updateLinks<N extends NodeDatumCore, L extends LinkDatumCore> (selection: Selection<SVGGElement, L, SVGGElement, L[]>, config: GraphConfigInterface<N, L>, duration: number, scale = 1): void {
  const { flowCircleSize, linkStyle, linkFlow, linkArrow, linkLabel, linkLabelShiftFromCenter } = config
  if (!selection.size()) return

  selection
    .classed(linkSelectors.linkDashed, d => getValue(d, linkStyle) === LinkStyle.DASHED)

  selection.select(`.${linkSelectors.link}`)
    .attr('class', linkSelectors.link)
    .attr('marker-mid', d => getMarker(d, scale, config))
    .style('stroke-width', d => getLinkStrokeWidth(d, scale, config))
    .style('stroke', d => getLinkColor(d, config))
    .attr('transform', getLinkShiftTransform)
    .each((d, i, elements) => {
      const el = select(elements[i])
      const x1 = getX(d.source as N)
      const y1 = getY(d.source as N)
      const x2 = getX(d.target as N)
      const y2 = getY(d.target as N)
      smartTransition(el, duration).attr('points', getPolylineData({ x1, y1, x2, y2 }))
    })

  const linkBand = selection.select(`.${linkSelectors.linkBand}`)
  linkBand
    .attr('class', linkSelectors.linkBand)
    .attr('transform', getLinkShiftTransform)
    .style('stroke-width', d => getLinkBandWidth(d, scale, config))
    .style('stroke', d => getLinkColor(d, config))

  smartTransition(linkBand, duration)
    .attr('x1', d => getX(d.source as N))
    .attr('y1', d => getY(d.source as N))
    .attr('x2', d => getX(d.target as N))
    .attr('y2', d => getY(d.target as N))

  const linkSupport = selection.select(`.${linkSelectors.linkSupport}`)
    .style('stroke', d => getLinkColor(d, config))

  smartTransition(linkSupport, duration).attr('transform', getLinkShiftTransform)
    .attr('x1', d => getX(d.source as N))
    .attr('y1', d => getY(d.source as N))
    .attr('x2', d => getX(d.target as N))
    .attr('y2', d => getY(d.target as N))

  const flowGroup = selection.select(`.${linkSelectors.flowGroup}`)
  flowGroup
    .attr('transform', getLinkShiftTransform)
    .style('display', d => getValue(d, linkFlow) ? null : 'none')
    .style('opacity', 0)
    .each((d, i, els) => {
      select(els[i]).selectAll(`.${linkSelectors.flowCircle}`)
        .attr('r', flowCircleSize / scale)
        .style('fill', getLinkColor(d, config))
    })

  smartTransition(flowGroup, duration).style('opacity', scale < ZOOM_LEVEL.LEVEL2 ? 0 : 1)

  // Labels
  selection.each((l, i, elements) => {
    const linkGroup = select(elements[i])
    const labelGroups = linkGroup.selectAll(`.${linkSelectors.labelGroups}`)
    const sideLabelDatum = getValue(l, linkLabel)
    const markerWidth = getValue(l, linkArrow) ? LINK_MARKER_WIDTH * 2 : 0
    const labelShift = getValue(l, linkLabelShiftFromCenter) ? -markerWidth + 4 : 0
    const labelTranslate = getLinkLabelShift(l, labelShift)

    const sideLabels = labelGroups.selectAll(`.${linkSelectors.labelGroup}`).data(sideLabelDatum ? [sideLabelDatum] : [])
    // Enter
    const sideLabelsEnter = sideLabels.enter().append('g')
      .attr('class', linkSelectors.labelGroup)
      .attr('transform', labelTranslate)
      .style('opacity', 0)

    sideLabelsEnter.append('circle')
      .attr('class', linkSelectors.labelCircle)
      .attr('r', 0)

    sideLabelsEnter.append('text')
      .attr('class', linkSelectors.labelContent)
      .attr('dy', 1)

    // Update
    const sideLabelsUpdate = sideLabels.merge(sideLabelsEnter)

    smartTransition(sideLabelsUpdate.select(`.${linkSelectors.labelCircle}`), duration)
      .attr('r', LINK_LABEL_RADIUS)
      .style('fill', d => d.color)

    sideLabelsUpdate.select(`.${linkSelectors.labelContent}`)
      .text(d => d.text)
      .style('fill', d => getSideTexLabelColor(d))
      .style('font-size', d => `${10 / Math.pow(d.text.toString().length, 0.3)}px`)

    smartTransition(sideLabelsUpdate, duration)
      .attr('transform', labelTranslate)
      .style('opacity', 1)

    // Exit
    const sideLabelsExit = sideLabels.exit()
    smartTransition(sideLabelsExit.select(`.${linkSelectors.labelCircle}`), duration)
      .attr('r', 0)

    smartTransition(sideLabelsExit, duration)
      .style('opacity', 0)
      .remove()
  })

  if (duration > 0) {
    selection.attr('pointer-events', 'none')
    const t = smartTransition(selection, duration) as Transition<SVGGElement, L, SVGGElement, L[]>
    t
      .attr('opacity', 1)
      .on('end interrupt', (d, i, elements) => {
        select(elements[i])
          .attr('pointer-events', 'stroke')
          .attr('opacity', 1)
      })
  } else {
    selection.attr('opacity', 1)
  }

  updateSelectedLinks(selection, config, scale)
}

export function removeLinks<N extends NodeDatumCore, L extends LinkDatumCore> (selection: Selection<SVGGElement, L, SVGGElement, L[]>, config: GraphConfigInterface<N, L>, duration: number): void {
  smartTransition(selection, duration / 2)
    .attr('opacity', 0)
    .remove()
}

export function animateLinkFlow<N extends NodeDatumCore, L extends LinkDatumCore> (selection: Selection<SVGGElement, L, SVGGElement, L[]>, config: GraphConfigInterface<N, L>, scale: number): void {
  const { linkFlow } = config
  if (scale < ZOOM_LEVEL.LEVEL2) return

  selection.selectAll(`.${linkSelectors.flowGroup}`)
    .each((d, i, elements) => {
      const link = d as L
      if (!getValue(link, linkFlow)) return
      const t = link._state.flowAnimTime
      const el = select(elements[i])
      const circles = el.selectAll(`.${linkSelectors.flowCircle}`)

      circles
        .attr('transform', index => {
          const tt = (t + (+index) / (circles.size() - 1)) % 1
          const x1 = getX(link.source as N)
          const y1 = getY(link.source as N)
          const x2 = getX(link.target as N)
          const y2 = getY(link.target as N)

          const x = x1 + tt * (x2 - x1)
          const y = y1 + tt * (y2 - y1)
          return `translate(${x}, ${y})`
        })
    })
}

export function zoomLinks<N extends NodeDatumCore, L extends LinkDatumCore> (selection: Selection<SVGGElement, L, SVGGElement, L[]>, config: GraphConfigInterface<N, L>, scale: number): void {
  const { flowCircleSize } = config

  selection.classed(generalSelectors.zoomOutLevel2, scale < ZOOM_LEVEL.LEVEL2)
  selection.selectAll(`.${linkSelectors.flowCircle}`)
    .attr('r', flowCircleSize / scale)

  const linkElements: Selection<SVGGElement, L, SVGGElement, L> = selection.selectAll(`.${linkSelectors.link}`)
  linkElements
    .attr('marker-mid', d => getMarker(d, scale, config))
    .style('stroke-width', d => getLinkStrokeWidth(d, scale, config))

  const linkBandElements: Selection<SVGGElement, L, SVGGElement, L> = selection.selectAll(`.${linkSelectors.linkBand}`)
  linkBandElements
    .style('stroke-width', d => getLinkBandWidth(d, scale, config))
}

export const zoomLinksThrottled = throttle(zoomLinks, 500)
