import { select, Selection } from 'd3-selection'
import { range } from 'd3-array'
import { Transition } from 'd3-transition'

// Utils
import { throttle, getValue, getBoolean } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getHref } from 'utils/misc'

// Types
import { GraphInputLink, GraphInputNode } from 'types/graph'

// Local Types
import { GraphCircleLabel, GraphLink, GraphLinkArrowStyle, GraphLinkStyle } from '../../types'

// Config
import { GraphConfigInterface } from '../../config'

// Helpers
import { getX, getY } from '../node/helper'
import {
  getPolylineData,
  getLinkShiftTransform,
  getLinkLabelShift,
  getLinkStrokeWidth,
  getLinkBandWidth,
  getLinkColor,
  getLinkLabelTextColor,
  LINK_LABEL_RADIUS,
  LINK_MARKER_WIDTH,
} from './helper'
import { ZoomLevel } from '../zoom-levels'

// Styles
import * as generalSelectors from '../../style'
import * as linkSelectors from './style'

export function createLinks<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphLink<N, L>, SVGGElement, unknown>
): void {
  selection.attr('opacity', 0)

  selection.append('line')
    .attr('class', linkSelectors.linkSupport)

  selection.append('polyline')
    .attr('class', linkSelectors.link)

  selection.append('line')
    .attr('class', linkSelectors.linkBand)
    .attr('x1', d => getX(d.source))
    .attr('y1', d => getY(d.source))
    .attr('x2', d => getX(d.target))
    .attr('y2', d => getY(d.target))

  selection.append('g')
    .attr('class', linkSelectors.flowGroup)
    .selectAll(`.${linkSelectors.flowCircle}`)
    .data(range(0, 6)).enter()
    .append('circle')
    .attr('class', linkSelectors.flowCircle)

  selection.append('g')
    .attr('class', linkSelectors.labelGroups)
}

export function updateSelectedLinks<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphLink<N, L>, SVGGElement, unknown>,
  config: GraphConfigInterface<N, L>,
  scale: number
): void {
  const isGreyedOut = (d, i): boolean => getBoolean(d, config.linkDisabled, i) || d._state.greyout
  selection
    .classed(linkSelectors.greyout, (d, i) => isGreyedOut(d, i))

  selection.each((d, i, elements) => {
    const element = elements[i]
    const group = select(element)
    group.select(`.${linkSelectors.link}`)
    group.select(`.${linkSelectors.linkBand}`)
    const linkSupport = group.select(`.${linkSelectors.linkSupport}`)

    linkSupport
      .style('stroke-opacity', (d._state.hovered || d._state.selected) ? 0.2 : 0)
      .style('stroke-width',
        d._state.selected
          ? getLinkBandWidth(d, scale, config) + 5
          : d._state.hovered ? getLinkBandWidth(d, scale, config) + 10 : null
      )
  })
}

export function updateLinks<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphLink<N, L>, SVGGElement, unknown>,
  config: GraphConfigInterface<N, L>,
  duration: number,
  scale = 1,
  getMarkerId: (d: GraphLink) => string
): void {
  const { linkFlowParticleSize, linkStyle, linkFlow, linkArrow, linkLabel, linkLabelShiftFromCenter } = config
  if (!selection.size()) return

  selection
    .classed(
      linkSelectors.linkDashed,
      d => getValue<GraphLink<N, L>, GraphLinkStyle>(d, linkStyle, d._indexGlobal) === GraphLinkStyle.Dashed
    )

  selection.each((d, i, elements) => {
    const element = elements[i]
    const linkGroup = select(element)
    const link = linkGroup.select(`.${linkSelectors.link}`)
    const linkBand = linkGroup.select(`.${linkSelectors.linkBand}`)
    const linkSupport = linkGroup.select(`.${linkSelectors.linkSupport}`)
    const flowGroup = linkGroup.select(`.${linkSelectors.flowGroup}`)

    const x1 = getX(d.source)
    const y1 = getY(d.source)
    const x2 = getX(d.target)
    const y2 = getY(d.target)

    link
      .attr('class', linkSelectors.link)
      .attr('marker-mid', getHref(d, getMarkerId))
      .style('stroke-width', getLinkStrokeWidth(d, scale, config))
      .style('stroke', getLinkColor(d, config))
      .attr('transform', getLinkShiftTransform(d, config.linkNeighborSpacing))

    smartTransition(link, duration)
      .attr('points', getPolylineData({ x1, y1, x2, y2 }))

    linkBand
      .attr('class', linkSelectors.linkBand)
      .attr('transform', getLinkShiftTransform(d, config.linkNeighborSpacing))
      .style('stroke-width', getLinkBandWidth(d, scale, config))
      .style('stroke', getLinkColor(d, config))

    smartTransition(linkBand, duration)
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2)

    linkSupport
      .style('stroke', getLinkColor(d, config))
      .attr('transform', getLinkShiftTransform(d, config.linkNeighborSpacing))
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2)

    flowGroup
      .attr('transform', getLinkShiftTransform(d, config.linkNeighborSpacing))
      .style('display', getBoolean(d, linkFlow, d._indexGlobal) ? null : 'none')
      .style('opacity', 0)

    flowGroup
      .selectAll(`.${linkSelectors.flowCircle}`)
      .attr('r', linkFlowParticleSize / scale)
      .style('fill', getLinkColor(d, config))

    smartTransition(flowGroup, duration)
      .style('opacity', scale < ZoomLevel.Level2 ? 0 : 1)

    // Labels
    const labelGroups = linkGroup.selectAll(`.${linkSelectors.labelGroups}`)
    const labelDatum = getValue<GraphLink<N, L>, GraphCircleLabel>(d, linkLabel, d._indexGlobal)
    const markerWidth = getValue<GraphLink<N, L>, GraphLinkArrowStyle>(d, linkArrow, d._indexGlobal) ? LINK_MARKER_WIDTH * 2 : 0
    const labelShift = getBoolean(d, linkLabelShiftFromCenter, d._indexGlobal) ? -markerWidth + 4 : 0
    const labelTranslate = getLinkLabelShift(d, config.linkNeighborSpacing, labelShift)

    const labels = labelGroups
      .selectAll<SVGGElement, GraphLink<N, L>>(`.${linkSelectors.labelGroup}`)
      .data(labelDatum && labelDatum.text ? [labelDatum] : [])

    // Enter
    const labelsEnter = labels.enter().append('g')
      .attr('class', linkSelectors.labelGroup)
      .attr('transform', labelTranslate)
      .style('opacity', 0)

    labelsEnter.append('circle')
      .attr('class', linkSelectors.labelCircle)
      .attr('r', 0)

    labelsEnter.append('text')
      .attr('class', linkSelectors.labelContent)

    // Update
    const labelsUpdate = labels.merge(labelsEnter)

    smartTransition(labelsUpdate.select(`.${linkSelectors.labelCircle}`), duration)
      .attr('r', label => label.radius ?? LINK_LABEL_RADIUS)
      .style('fill', label => label.color)

    labelsUpdate.select(`.${linkSelectors.labelContent}`)
      .text(label => label.text)
      .attr('dy', '0.1em')
      .style('fill', label => label.textColor ?? getLinkLabelTextColor(label))
      .style('font-size', label => {
        if (label.fontSize) return label.fontSize
        const radius = label.radius ?? LINK_LABEL_RADIUS
        return `${radius / Math.pow(label.text.toString().length, 0.4)}px`
      })

    smartTransition(labelsUpdate, duration)
      .attr('transform', labelTranslate)
      .style('cursor', label => label.cursor)
      .style('opacity', 1)

    // Exit
    const labelsExit = labels.exit()
    smartTransition(labelsExit.select(`.${linkSelectors.labelCircle}`), duration)
      .attr('r', 0)

    smartTransition(labelsExit, duration)
      .style('opacity', 0)
      .remove()
  })

  if (duration > 0) {
    selection.attr('pointer-events', 'none')
    const t = smartTransition(selection, duration) as Transition<SVGGElement, GraphLink<N, L>, SVGGElement, GraphLink<N, L>>
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

export function removeLinks<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphLink<N, L>, SVGGElement, unknown>,
  config: GraphConfigInterface<N, L>,
  duration: number
): void {
  smartTransition(selection, duration / 2)
    .attr('opacity', 0)
    .remove()
}

export function animateLinkFlow<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphLink<N, L>, SVGGElement, unknown>,
  config: GraphConfigInterface<N, L>,
  scale: number
): void {
  const { linkFlow } = config
  if (scale < ZoomLevel.Level2) return

  selection.each((d, i, elements) => {
    const element = elements[i]
    const linkGroup = select(element)
    const flowGroup = linkGroup.select(`.${linkSelectors.flowGroup}`)

    if (!getBoolean(d, linkFlow, d._indexGlobal)) return
    const t = d._state.flowAnimTime
    const circles = flowGroup.selectAll(`.${linkSelectors.flowCircle}`)

    circles
      .attr('transform', index => {
        const tt = (t + (+index) / (circles.size() - 1)) % 1
        const x1 = getX(d.source)
        const y1 = getY(d.source)
        const x2 = getX(d.target)
        const y2 = getY(d.target)

        const x = x1 + tt * (x2 - x1)
        const y = y1 + tt * (y2 - y1)
        return `translate(${x}, ${y})`
      })
  })
}

export function zoomLinks<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphLink<N, L>, SVGGElement, unknown>,
  config: GraphConfigInterface<N, L>,
  scale: number,
  getMarkerId: (d: GraphLink) => string
): void {
  const { linkFlowParticleSize } = config

  selection.classed(generalSelectors.zoomOutLevel2, scale < ZoomLevel.Level2)
  selection.selectAll(`.${linkSelectors.flowCircle}`)
    .attr('r', linkFlowParticleSize / scale)

  const linkElements = selection.selectAll<SVGGElement, GraphLink<N, L>>(`.${linkSelectors.link}`)
  linkElements
    .attr('marker-mid', d => getHref(d, getMarkerId))
    .style('stroke-width', d => getLinkStrokeWidth(d, scale, config))

  const linkBandElements = selection.selectAll<SVGGElement, GraphLink<N, L>>(`.${linkSelectors.linkBand}`)
  linkBandElements
    .style('stroke-width', d => getLinkBandWidth(d, scale, config))
}

export const zoomLinksThrottled = throttle(zoomLinks, 500)
