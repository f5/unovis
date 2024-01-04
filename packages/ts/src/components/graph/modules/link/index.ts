import { select, Selection } from 'd3-selection'
import { range } from 'd3-array'
import { Transition } from 'd3-transition'

// Utils
import { throttle, getValue, getNumber, getBoolean } from 'utils/data'
import { smartTransition } from 'utils/d3'

// Types
import { GraphInputLink, GraphInputNode } from 'types/graph'

// Local Types
import { GraphCircleLabel, GraphLink, GraphLinkArrowStyle, GraphLinkStyle } from '../../types'

// Config
import { GraphConfigInterface } from '../../config'

// Helpers
import { getX, getY } from '../node/helper'
import {
  getLinkShiftTransform,
  getLinkStrokeWidth,
  getLinkBandWidth,
  getLinkColor,
  getLinkLabelTextColor,
  LINK_LABEL_RADIUS,
  getLinkArrowStyle,
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

  selection.append('path')
    .attr('class', linkSelectors.linkSupport)

  selection.append('path')
    .attr('class', linkSelectors.link)

  selection.append('path')
    .attr('class', linkSelectors.linkBand)

  selection.append('use')
    .attr('class', linkSelectors.linkArrow)

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
  const isGreyedOut = (d: GraphLink<N, L>, i: number): boolean => getBoolean(d, config.linkDisabled, i) || d._state.greyout
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
  getLinkArrowDefId: (arrow: GraphLinkArrowStyle | undefined) => string
): void {
  const { linkFlowParticleSize, linkStyle, linkFlow, linkLabel, linkLabelShiftFromCenter } = config
  if (!selection.size()) return

  selection
    .classed(
      linkSelectors.linkDashed,
      d => getValue<GraphLink<N, L>, GraphLinkStyle>(d, linkStyle, d._indexGlobal) === GraphLinkStyle.Dashed
    )

  selection.each((d, i, elements) => {
    const element = elements[i]
    const linkGroup = select(element)
    const link = linkGroup.select<SVGPathElement>(`.${linkSelectors.link}`)
    const linkBand = linkGroup.select<SVGPathElement>(`.${linkSelectors.linkBand}`)
    const linkSupport = linkGroup.select<SVGPathElement>(`.${linkSelectors.linkSupport}`)
    const linkArrow = linkGroup.select<SVGUseElement>(`.${linkSelectors.linkArrow}`)
    const flowGroup = linkGroup.select(`.${linkSelectors.flowGroup}`)
    const linkColor = getLinkColor(d, config)
    const linkShiftTransform = getLinkShiftTransform(d, config.linkNeighborSpacing)

    const x1 = getX(d.source)
    const y1 = getY(d.source)
    const x2 = getX(d.target)
    const y2 = getY(d.target)

    const curvature = getNumber(d, config.linkCurvature, i) ?? 0
    const cp1x = x1 + (x2 - x1) * 0.5 * curvature
    const cp1y = y1 + (y2 - y1) * 0.0 * curvature
    const cp2x = x1 + (x2 - x1) * 0.5 * curvature
    const cp2y = y1 + (y2 - y1) * 1.0 * curvature

    const pathData = `M${x1},${y1} C${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`
    link
      .attr('class', linkSelectors.link)
      .style('stroke-width', getLinkStrokeWidth(d, scale, config))
      .style('stroke', linkColor)
      .attr('transform', linkShiftTransform)

    smartTransition(link, duration)
      .attr('d', pathData)

    linkBand
      .attr('class', linkSelectors.linkBand)
      .attr('transform', linkShiftTransform)
      .style('stroke-width', getLinkBandWidth(d, scale, config))
      .style('stroke', linkColor)

    smartTransition(linkBand, duration)
      .attr('d', pathData)

    linkSupport
      .style('stroke', linkColor)
      .attr('transform', linkShiftTransform)
      .attr('d', pathData)

    // Arrow
    const linkArrowStyle = getLinkArrowStyle(d, config)
    const linkPathElement = linkSupport.node()
    const pathLength = linkPathElement.getTotalLength()
    if (linkArrowStyle) {
      const arrowPos = pathLength * 0.5
      const p1 = linkPathElement.getPointAtLength(arrowPos)
      const p2 = linkPathElement.getPointAtLength(arrowPos + 1) // A point very close to p1

      // Calculate the angle for the arrowhead
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI)
      linkArrow
        .attr('href', `#${getLinkArrowDefId(linkArrowStyle)}`)
        .attr('fill', linkColor)
        .attr('transform', `translate(${p1.x}, ${p1.y}) rotate(${angle})`)
    } else {
      linkArrow.attr('href', null)
    }

    // Particle Flow
    flowGroup
      .attr('transform', linkShiftTransform)
      .style('display', getBoolean(d, linkFlow, d._indexGlobal) ? null : 'none')
      .style('opacity', 0)

    flowGroup
      .selectAll(`.${linkSelectors.flowCircle}`)
      .attr('r', linkFlowParticleSize / scale)
      .style('fill', linkColor)

    smartTransition(flowGroup, duration)
      .style('opacity', scale < ZoomLevel.Level2 ? 0 : 1)

    // Labels
    const labelGroups = linkGroup.selectAll(`.${linkSelectors.labelGroups}`)
    const labelDatum = getValue<GraphLink<N, L>, GraphCircleLabel>(d, linkLabel, d._indexGlobal)
    const markerWidth = linkArrowStyle ? LINK_MARKER_WIDTH * 2 : 0
    const labelShift = getBoolean(d, linkLabelShiftFromCenter, d._indexGlobal) ? -markerWidth + 4 : 0
    const labelPos = linkPathElement.getPointAtLength(pathLength / 2 + labelShift)
    const labelTranslate = `translate(${labelPos.x}, ${labelPos.y})`

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

    const linkPathElement = linkGroup.select<SVGPathElement>(`.${linkSelectors.link}`).node()
    const pathLength = linkPathElement.getTotalLength()

    if (!getBoolean(d, linkFlow, d._indexGlobal)) return
    const t = d._state.flowAnimTime
    const circles = flowGroup.selectAll(`.${linkSelectors.flowCircle}`)

    circles
      .attr('transform', index => {
        const tt = (t + (+index) / (circles.size() - 1)) % 1
        const p = linkPathElement.getPointAtLength(tt * pathLength)
        return `translate(${p.x}, ${p.y})`
      })
  })
}

export function zoomLinks<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphLink<N, L>, SVGGElement, unknown>,
  config: GraphConfigInterface<N, L>,
  scale: number
): void {
  const { linkFlowParticleSize } = config

  selection.classed(generalSelectors.zoomOutLevel2, scale < ZoomLevel.Level2)
  selection.selectAll(`.${linkSelectors.flowCircle}`)
    .attr('r', linkFlowParticleSize / scale)

  const linkElements = selection.selectAll<SVGGElement, GraphLink<N, L>>(`.${linkSelectors.link}`)
  linkElements
    .style('stroke-width', d => getLinkStrokeWidth(d, scale, config))

  const linkBandElements = selection.selectAll<SVGGElement, GraphLink<N, L>>(`.${linkSelectors.linkBand}`)
  linkBandElements
    .style('stroke-width', d => getLinkBandWidth(d, scale, config))
}

export const zoomLinksThrottled = throttle(zoomLinks, 500)
