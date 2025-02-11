import { select, Selection } from 'd3-selection'
import { range, sum } from 'd3-array'
import { Transition } from 'd3-transition'
import toPx from 'to-px'

// Utils
import { throttle, getValue, getNumber, getBoolean, ensureArray } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getCSSVariableValueInPixels } from 'utils/misc'
import { estimateStringPixelLength } from 'utils/text'

// Types
import { GraphInputLink, GraphInputNode } from 'types/graph'

// Local Types
import { GraphCircleLabel, GraphLink, GraphLinkArrowStyle, GraphLinkStyle } from '../../types'

// Config
import { GraphConfigInterface } from '../../config'

// Helpers
import { getX, getY, isInternalHref } from '../node/helper'
import {
  getLinkShiftTransform,
  getLinkStrokeWidth,
  getLinkBandWidth,
  getLinkColor,
  getLinkLabelTextColor,
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
    .style('opacity', 0)
    .selectAll(`.${linkSelectors.flowCircle}`)
    .data(range(0, 6)).enter()
    .append('circle')
    .attr('class', linkSelectors.flowCircle)
}

/** Updates the links partially according to their `_state` */
export function updateLinksPartial<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphLink<N, L>, SVGGElement, unknown>,
  config: GraphConfigInterface<N, L>,
  scale: number
): void {
  const isGreyedOut = (d: GraphLink<N, L>, i: number): boolean => getBoolean(d, config.linkDisabled, i) || d._state.greyout
  selection
    .classed(linkSelectors.greyedOutLink, (d, i) => isGreyedOut(d, i))

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

export function updateLinkLines<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphLink<N, L>, SVGGElement, unknown>,
  config: GraphConfigInterface<N, L>,
  duration: number,
  scale = 1,
  getLinkArrowDefId: (arrow: GraphLinkArrowStyle | undefined) => string,
  linkPathLengthMap: Map<string, number>
): Selection<SVGGElement, GraphLink<N, L>, SVGGElement, unknown> {
  return selection.each((d, i, elements) => {
    const element = elements[i]
    const linkGroup = select(element)
    const link = linkGroup.select<SVGPathElement>(`.${linkSelectors.link}`)
    const linkBand = linkGroup.select<SVGPathElement>(`.${linkSelectors.linkBand}`)
    const linkSupport = linkGroup.select<SVGPathElement>(`.${linkSelectors.linkSupport}`)
    const linkArrow = linkGroup.select<SVGUseElement>(`.${linkSelectors.linkArrow}`)
    const linkColor = getLinkColor(d, config)
    const linkShiftTransform = getLinkShiftTransform(d, config.linkNeighborSpacing)
    const linkLabelData = ensureArray(
      getValue<GraphLink<N, L>, GraphCircleLabel | GraphCircleLabel[]>(d, config.linkLabel, d._indexGlobal)
    )
    const offsetSource = getValue(d, config.linkSourcePointOffset, i)
    const offsetTarget = getValue(d, config.linkTargetPointOffset, i)
    const x1 = getX(d.source) + (offsetSource?.[0] || 0)
    const y1 = getY(d.source) + (offsetSource?.[1] || 0)
    const x2 = getX(d.target) + (offsetTarget?.[0] || 0)
    const y2 = getY(d.target) + (offsetTarget?.[1] || 0)

    const curvature = getNumber(d, config.linkCurvature, i) ?? 0
    const cp1x = x1 + (x2 - x1) * 0.5 * curvature
    const cp1y = y1 + (y2 - y1) * 0.0 * curvature
    const cp2x = x1 + (x2 - x1) * 0.5 * curvature
    const cp2y = y1 + (y2 - y1) * 1.0 * curvature

    const pathData = `M${x1},${y1} C${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`
    const linkPathElement = linkSupport.attr('d', pathData).node()
    const cachedLinkPathLength = linkPathLengthMap.get(pathData)
    const pathLength = cachedLinkPathLength ?? linkPathElement.getTotalLength()
    if (!cachedLinkPathLength) linkPathLengthMap.set(pathData, pathLength)

    linkSupport
      .style('stroke', linkColor)
      .attr('transform', linkShiftTransform)

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


    // Arrow
    const linkArrowStyle = getLinkArrowStyle(d, config)
    if (linkArrowStyle) {
      const arrowPos = pathLength * (linkLabelData.length ? 0.65 : 0.5)
      const p1 = linkPathElement.getPointAtLength(arrowPos)
      const p2 = linkPathElement.getPointAtLength(arrowPos + 1) // A point very close to p1

      // Calculate the angle for the arrowhead
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI)
      const arrowWasShownBefore = linkArrow.attr('href')
      linkArrow
        .attr('href', `#${getLinkArrowDefId(linkArrowStyle)}`)

      smartTransition(linkArrow, arrowWasShownBefore ? duration : 0)
        .attr('fill', linkColor)
        .attr('transform', `translate(${p1.x}, ${p1.y}) rotate(${angle})`)
    } else {
      linkArrow.attr('href', null)
    }
  })
}

export function updateLinks<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphLink<N, L>, SVGGElement, unknown>,
  config: GraphConfigInterface<N, L>,
  duration: number,
  scale = 1,
  getLinkArrowDefId: (arrow: GraphLinkArrowStyle | undefined) => string,
  linkPathLengthMap: Map<string, number>
): void {
  const { linkFlowParticleSize, linkStyle, linkFlow, linkLabel, linkLabelShiftFromCenter } = config
  if (!selection.size()) return

  selection
    .classed(
      linkSelectors.linkDashed,
      d => getValue<GraphLink<N, L>, GraphLinkStyle>(d, linkStyle, d._indexGlobal) === GraphLinkStyle.Dashed
    )

  // Update line and arrow positions
  updateLinkLines(selection, config, duration, scale, getLinkArrowDefId, linkPathLengthMap)

  // Update labels and link flow (particles) groups
  selection.each((d, i, elements) => {
    const element = elements[i]
    const linkGroup = select(element)
    const flowGroup = linkGroup.select(`.${linkSelectors.flowGroup}`)
    const linkSupport = linkGroup.select<SVGPathElement>(`.${linkSelectors.linkSupport}`)
    const linkPathElement = linkSupport.node()
    const linkColor = getLinkColor(d, config)
    const linkShiftTransform = getLinkShiftTransform(d, config.linkNeighborSpacing)
    const linkLabelData = ensureArray(
      getValue<GraphLink<N, L>, GraphCircleLabel | GraphCircleLabel[]>(d, linkLabel, d._indexGlobal)
    )

    // Particle Flow
    flowGroup
      .attr('transform', linkShiftTransform)
      .style('display', getBoolean(d, linkFlow, d._indexGlobal) ? null : 'none')

    flowGroup
      .selectAll(`.${linkSelectors.flowCircle}`)
      .attr('r', linkFlowParticleSize / scale)
      .style('fill', linkColor)

    smartTransition(flowGroup, duration)
      .style('opacity', scale < ZoomLevel.Level2 ? 0 : 1)

    // Labels
    // Preparing the labels before rendering to be able to center them
    const linkLabelsDataPrepared = linkLabelData.map((linkLabelDatum) => {
      const text = linkLabelDatum.text?.toString() || ''
      const shouldRenderUseElement = isInternalHref(text)
      const fontSizePx = toPx(linkLabelDatum.fontSize) ?? getCSSVariableValueInPixels('var(--vis-graph-link-label-font-size)', linkGroup.node())
      const shouldBeRenderedAsCircle = text.length <= 2 || shouldRenderUseElement
      const paddingVertical = 4
      const paddingHorizontal = shouldBeRenderedAsCircle ? paddingVertical : 8
      const estimatedWidthPx = estimateStringPixelLength(text, fontSizePx)

      return {
        ...linkLabelDatum,
        _shouldRenderUseElement: shouldRenderUseElement,
        _fontSizePx: fontSizePx,
        _shouldBeRenderedAsCircle: shouldBeRenderedAsCircle,
        _paddingVertical: paddingVertical,
        _paddingHorizontal: paddingHorizontal,
        _estimatedWidthPx: estimatedWidthPx,
        _borderRadius: linkLabelDatum.radius ?? (shouldBeRenderedAsCircle ? fontSizePx : 4),
        _backgroundWidth: (shouldBeRenderedAsCircle ? fontSizePx : estimatedWidthPx) + paddingHorizontal * 2,
        _backgroundHeight: fontSizePx + paddingVertical * 2,
      }
    })
    type GraphCircleLabelPrepared = typeof linkLabelsDataPrepared[0]
    const linkLabelGroups = linkGroup
      .selectAll<SVGGElement, GraphCircleLabelPrepared>(`.${linkSelectors.linkLabelGroup}`)
      .data(linkLabelsDataPrepared, (d: GraphCircleLabelPrepared) => d.text)

    const linkLabelGroupsEnter = linkLabelGroups.enter().append('g').attr('class', linkSelectors.linkLabelGroup)
    linkLabelGroupsEnter.each((linkLabelDatum, i, elements) => {
      const linkLabelGroup = select<SVGGElement, GraphCircleLabelPrepared>(elements[i])
      linkLabelGroup.append('rect').attr('class', linkSelectors.linkLabelBackground)

      const linkLabelText = linkLabelDatum ? linkLabelDatum.text?.toString() : undefined
      const shouldRenderUseElement = isInternalHref(linkLabelText)
      linkLabelGroup.select<SVGTextElement>(`.${linkSelectors.linkLabelContent}`).remove()
      linkLabelGroup
        .append(shouldRenderUseElement ? 'use' : 'text')
        .attr('class', linkSelectors.linkLabelContent)
    })
    linkLabelGroupsEnter.style('opacity', 0)

    const linkLabelGroupsMerged = linkLabelGroups.merge(linkLabelGroupsEnter)
    const linkLabelMargin = 1
    let linkLabelShiftCumulative = -sum(linkLabelsDataPrepared, d => d._backgroundWidth + linkLabelMargin) / 2 // Centering the labels
    const cachedLinkPathLength = linkPathLengthMap.get(linkPathElement.getAttribute('d'))
    const pathLength = cachedLinkPathLength ?? linkPathElement.getTotalLength()
    const linkArrowStyle = getLinkArrowStyle(d, config)
    linkLabelGroupsMerged.each((linkLabelDatum, i, elements) => {
      const element = elements[i]
      const linkLabelGroup = select<SVGGElement, GraphCircleLabelPrepared>(element)
      const linkLabelText = linkLabelDatum.text?.toString()
      const linkLabelContent = linkLabelGroup.select<SVGTextElement | SVGUseElement>(`.${linkSelectors.linkLabelContent}`)
      const linkMarkerWidth = linkArrowStyle ? LINK_MARKER_WIDTH * 2 : 0
      const linkLabelShift = getBoolean(d, linkLabelShiftFromCenter, d._indexGlobal) ? -linkMarkerWidth + 4 : 0
      const linkLabelPos = linkPathElement.getPointAtLength(pathLength / 2 + linkLabelShift + linkLabelShiftCumulative + linkLabelDatum._backgroundWidth / 2)
      const linkLabelTranslate = `translate(${linkLabelPos.x}, ${linkLabelPos.y})`
      const linkLabelBackground = linkLabelGroup.select<SVGRectElement>(`.${linkSelectors.linkLabelBackground}`)

      // If the label was not displayed before, we set the initial transform
      if (!linkLabelGroup.attr('transform')) {
        linkLabelGroup.attr('transform', `${linkLabelTranslate} scale(0)`)
      }

      const linkLabelColor = linkLabelDatum.textColor ?? getLinkLabelTextColor(linkLabelDatum)
      if (linkLabelDatum._shouldRenderUseElement) {
        linkLabelContent
          .attr('href', linkLabelText)
          .attr('x', -linkLabelDatum._fontSizePx / 2)
          .attr('y', -linkLabelDatum._fontSizePx / 2)
          .attr('width', linkLabelDatum._fontSizePx)
          .attr('height', linkLabelDatum._fontSizePx)
          .style('fill', linkLabelColor)
      } else {
        linkLabelContent
          .text(linkLabelText)
          .attr('dy', '0.1em')
          .style('font-size', linkLabelDatum._fontSizePx)
          .style('fill', linkLabelColor)
      }

      linkLabelGroup.attr('hidden', null)
        .style('cursor', linkLabelDatum.cursor)

      smartTransition(linkLabelGroup, duration)
        .attr('transform', `${linkLabelTranslate} scale(1)`)
        .style('opacity', 1)

      linkLabelBackground
        .attr('x', -linkLabelDatum._backgroundWidth / 2)
        .attr('y', -linkLabelDatum._backgroundHeight / 2)
        .attr('width', linkLabelDatum._backgroundWidth)
        .attr('height', linkLabelDatum._backgroundHeight)
        .attr('rx', linkLabelDatum._borderRadius)
        .style('fill', linkLabelDatum.color)

      linkLabelShiftCumulative += linkLabelDatum._backgroundWidth + linkLabelMargin
    })

    smartTransition(linkLabelGroups.exit(), duration)
      .style('opacity', 0)
      .remove()
  })

  // Pointer Events
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

  updateLinksPartial(selection, config, scale)
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
  scale: number,
  linkPathLengthMap: Map<string, number>
): void {
  const { linkFlow } = config
  if (scale < ZoomLevel.Level2) return

  selection.each((d, i, elements) => {
    const element = elements[i]
    const linkGroup = select(element)
    const flowGroup = linkGroup.select(`.${linkSelectors.flowGroup}`)

    const linkPathElement = linkGroup.select<SVGPathElement>(`.${linkSelectors.linkSupport}`).node()
    const cachedLinkPathLength = linkPathLengthMap.get(linkPathElement.getAttribute('d'))
    const pathLength = cachedLinkPathLength ?? linkPathElement.getTotalLength()

    if (!getBoolean(d, linkFlow, d._indexGlobal) || !pathLength) return
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

  selection.select(`.${linkSelectors.flowGroup}`)
    .style('opacity', scale < ZoomLevel.Level2 ? 0 : 1)

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

