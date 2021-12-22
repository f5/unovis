// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'
import { Transition } from 'd3-transition'
import { arc } from 'd3-shape'

// Types
import { Shape } from 'types/shape'
import { GraphInputLink, GraphInputNode } from 'types/graph'

// Utils
import { trimText } from 'utils/text'
import { polygon } from 'utils/path'
import { smartTransition } from 'utils/d3'
import { getBoolean, getNumber, getString, getValue, throttle } from 'utils/data'

// Local Types
import { GraphNode, GraphCircleLabel, GraphNodeAnimationState, GraphNodeAnimatedElement } from '../../types'

// Config
import { GraphConfig } from '../../config'

// Helpers
import {
  arcTween,
  polyTween,
  setLabelRect,
  getX,
  getY,
  getSideTexLabelColor,
  getNodeColor,
  getNodeIconColor,
  getNodeSize,
  LABEL_RECT_VERTICAL_PADDING,
} from './helper'
import { appendShape, updateShape, isCustomXml } from '../shape'
import { ZoomLevel } from '../zoom-levels'

// Styles
import * as generalSelectors from '../../style'
import * as nodeSelectors from './style'

const SIDE_LABEL_SIZE = 10

export function createNodes<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, GraphNode<N, L>>,
  config: GraphConfig<N, L>
): void {
  const { nodeShape } = config

  selection.each((d, i, elements) => {
    const element = elements[i]
    const group = select(element)
    group
      .attr('transform', (d: GraphNode<N, L>) => {
        const configuredPosition = getValue<GraphNode<N, L>, [number, number] | undefined>(d, config.nodeEnterPosition)
        const scale = getNumber(d, config.nodeEnterScale) ?? 0
        const x = configuredPosition?.[0] ?? getX(d)
        const y = configuredPosition?.[1] ?? getY(d)
        return `translate(${x}, ${y}) scale(${scale})`
      })
      .attr('opacity', 0)

    const shape = getString(d, nodeShape)
    /** Todo: The 'nodeShape' storing logic below it a temporary fix, needs a cleaner implementation */
    // eslint-disable-next-line dot-notation
    element['nodeShape'] = shape
    group.call(appendShape, shape, nodeSelectors.node, nodeSelectors.customNode)
    group.call(appendShape, shape, nodeSelectors.nodeSelection)
    group.append('path').attr('class', nodeSelectors.nodeArc)
    group.append('text').attr('class', nodeSelectors.nodeIcon)

    const label = group.append('g').attr('class', nodeSelectors.label)
    label.append('rect').attr('class', nodeSelectors.labelBackground)

    const labelText = label.append('text')
      .attr('class', nodeSelectors.labelText)
      .attr('dy', '0.32em')
    labelText.append('tspan').attr('class', nodeSelectors.labelTextContent)
    labelText.append('tspan')
      .attr('class', nodeSelectors.subLabelTextContent)
      .attr('dy', '1.1em')
      .attr('x', '0')

    group.append('g')
      .attr('class', nodeSelectors.sideLabelsGroup)

    group.append('text')
      .attr('class', nodeSelectors.nodeBottomIcon)
  })
}

export function updateSelectedNodes<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, GraphNode<N, L>>,
  config: GraphConfig<N, L>
): void {
  const { nodeDisabled } = config

  selection.each((d, i, elements) => {
    const group: Selection<SVGGElement, N, SVGGElement, N> = select(elements[i])
    const isGreyout = getBoolean(d, nodeDisabled) || d._state.greyout

    group.classed(nodeSelectors.greyoutNode, isGreyout)
      .classed(nodeSelectors.draggable, !config.disableDrag)

    const nodeSelection: Selection<SVGGElement, N, SVGGElement, N> = group.selectAll(`.${nodeSelectors.nodeSelection}`)
    nodeSelection.classed(nodeSelectors.nodeSelectionActive, d._state.selected)

    group.selectAll(`.${nodeSelectors.sideLabel}`)
      .style('fill', (l: GraphCircleLabel) => isGreyout ? null : getSideTexLabelColor(l))

    group.selectAll(`.${nodeSelectors.sideLabelBackground}`)
      .style('fill', (l: GraphCircleLabel) => isGreyout ? null : l.color)
  })
}

export function updateNodes<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, GraphNode<N, L>>,
  config: GraphConfig<N, L>,
  duration: number,
  scale = 1
): Selection<SVGGElement, GraphNode<N, L>, SVGGElement, GraphNode<N, L>> | Transition<SVGGElement, GraphNode<N, L>, SVGGElement, GraphNode<N, L>> {
  const { scoreAnimDuration, nodeBorderWidth, nodeShape, nodeSize, nodeStrokeSegmentValue, nodeStrokeSegmentFill, nodeIcon, nodeIconSize, nodeLabel, nodeSubLabel, nodeSideLabels, nodeStroke, nodeFill, nodeBottomIcon } = config

  // Re-create nodes to update shapes if they were changes
  selection.each((d, i, elements) => {
    const element = elements[i]
    const group = select(element)
    const shape = getString(d, nodeShape)

    // eslint-disable-next-line dot-notation
    if (element['nodeShape'] !== shape) {
      group.select(`.${nodeSelectors.node}`).remove()
      group.call(appendShape, nodeShape, nodeSelectors.node, nodeSelectors.customNode, `.${nodeSelectors.nodeSelection}`)
      group.select(`.${nodeSelectors.nodeSelection}`).remove()
      group.call(appendShape, shape, nodeSelectors.nodeSelection, null, `.${nodeSelectors.nodeArc}`)
      // eslint-disable-next-line dot-notation
      element['nodeShape'] = shape
    }
  })

  // Update nodes themselves
  selection.each((d, i, elements) => {
    const groupElement = elements[i]
    const group: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, GraphNode<N, L>> = select(groupElement)
    const node: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, GraphNode<N, L>> = group.select(`.${nodeSelectors.node}`)
    const nodeArc = group.select(`.${nodeSelectors.nodeArc}`)
    const icon = group.select(`.${nodeSelectors.nodeIcon}`)
    const sideLabelsGroup = group.select(`.${nodeSelectors.sideLabelsGroup}`)
    const label: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, GraphNode<N, L>> = group.select(`.${nodeSelectors.label}`)
    const labelTextContent = label.select(`.${nodeSelectors.labelTextContent}`)
    const sublabelTextContent = label.select(`.${nodeSelectors.subLabelTextContent}`)
    const bottomIcon = group.select(`.${nodeSelectors.nodeBottomIcon}`)
    const nodeSelection = group.select(`.${nodeSelectors.nodeSelection}`)

    group
      .classed(generalSelectors.zoomOutLevel2, scale < ZoomLevel.Level2)
      .classed(nodeSelectors.nodeIsDragged, (d: GraphNode<N, L>) => d._state.isDragged)

    // Update Group
    group
      .classed(nodeSelectors.nodePolygon, d => {
        const shape = getString(d, nodeShape)
        return shape === Shape.Triangle || shape === Shape.Hexagon || shape === Shape.Square
      })

    // Update Node
    node
      .call(updateShape, nodeShape, nodeSize)
      .attr('stroke-width', d => getNumber(d, nodeBorderWidth) ?? 0)
      .style('fill', d => getNodeColor(d, nodeFill))
      .style('stroke', d => getString(d, nodeStroke) ?? null)

    const nodeBBox = (node.node() as SVGGraphicsElement).getBBox()

    const arcGenerator = arc<GraphNodeAnimationState>()
      .innerRadius(d => getNodeSize(d, nodeSize) / 2 - (getNumber(d, nodeBorderWidth) / 2))
      .outerRadius(d => getNodeSize(d, nodeSize) / 2 + (getNumber(d, nodeBorderWidth) / 2))
      .startAngle(0 * (Math.PI / 180))
      // eslint-disable-next-line dot-notation
      .endAngle(a => a['endAngle'])

    nodeArc
      .attr('stroke-width', d => getNumber(d, nodeBorderWidth))
      .style('display', d => !getNumber(d, nodeStrokeSegmentValue) ? 'none' : null)
      .style('fill', getNodeColor(d, nodeStrokeSegmentFill))
      .style('stroke', getNodeColor(d, nodeStrokeSegmentFill))
      .style('stroke-opacity', d => getString(d, nodeShape) === Shape.Circle ? 0 : null)

    nodeArc
      .transition()
      .duration(scoreAnimDuration)
      .attrTween('d', (d, i, arr: GraphNodeAnimatedElement<SVGElement>[]) => {
        switch (getString(d, nodeShape)) {
          case Shape.Circle: return arcTween(d, config, arcGenerator, arr[i])
          case Shape.Hexagon: return polyTween(d, config, polygon, arr[i])
          case Shape.Square: return polyTween(d, config, polygon, arr[i])
          case Shape.Triangle: return polyTween(d, config, polygon, arr[i])
          default: return null
        }
      })

    // Set Node Selection
    nodeSelection
      .call(updateShape, nodeShape, nodeSize)

    // Update Node Icon
    icon
      .style('font-size', d => `${getNumber(d, nodeIconSize) ?? 2.5 * Math.sqrt(getNodeSize(d, nodeSize))}px`)
      .attr('dy', 1)
      .style('fill', d => getNodeIconColor(d, nodeFill))
      .html(d => getString(d, nodeIcon))

    // Side Labels
    const sideLabelsData = getValue<GraphNode<N, L>, GraphCircleLabel[]>(d, nodeSideLabels) || []
    const sideLabels = sideLabelsGroup.selectAll('g').data(sideLabelsData as GraphCircleLabel[])
    const sideLabelsEnter = sideLabels.enter().append('g')
      .attr('class', nodeSelectors.sideLabelGroup)
    sideLabelsEnter.append('circle')
      .attr('class', nodeSelectors.sideLabelBackground)
      .attr('r', SIDE_LABEL_SIZE)
    sideLabelsEnter.append('text')
      .attr('class', nodeSelectors.sideLabel)

    const sideLabelsUpdate = sideLabels.merge(sideLabelsEnter)
      .style('cursor', (d: GraphCircleLabel) => d.cursor ?? null)

    // Side label text
    sideLabelsUpdate.select(`.${nodeSelectors.sideLabel}`).html(d => d.text)
      .attr('dy', '1px')
      .style('fill', l => getSideTexLabelColor(l))
      .style('font-size', d => d.fontSize ?? `${11 / Math.pow(d.text.toString().length, 0.3)}px`)
      // Side label circle background
    sideLabelsUpdate.select(`.${nodeSelectors.sideLabelBackground}`)
      .style('fill', d => d.color)

    sideLabelsUpdate.attr('transform', (l, i) => {
      if (sideLabelsData.length === 1) return `translate(${getNodeSize(d, nodeSize) / 2.5}, ${-getNodeSize(d, nodeSize) / 2.5})`
      const r = 1.05 * getNodeSize(d, nodeSize) / 2
      // const angle = i * Math.PI / 4 - Math.PI / 2
      const angle = i * 1.15 * 2 * Math.atan2(SIDE_LABEL_SIZE, r) - Math.PI / 3
      return `translate(${r * Math.cos(angle)}, ${r * Math.sin(angle)})`
    })

    sideLabels.exit().remove()

    // Set Label and Sublabel text
    const labelText = getString(d, nodeLabel)
    const sublabelText = getString(d, nodeSubLabel)
    const labelTextTrimmed = trimText(getString(d, nodeLabel))
    const sublabelTextTrimmed = trimText(getString(d, nodeSubLabel))

    labelTextContent.text(labelTextTrimmed)
    sublabelTextContent.text(sublabelTextTrimmed)
    group
      .on('mouseenter', () => {
        labelTextContent.text(labelText)
        sublabelTextContent.text(sublabelText)
        setLabelRect(label, labelText, nodeSelectors.labelText)
        group.raise()
      })
      .on('mouseleave', () => {
        labelTextContent.text(labelTextTrimmed)
        sublabelTextContent.text(sublabelTextTrimmed)
        setLabelRect(label, labelTextTrimmed, nodeSelectors.labelText)
      })

    // Position label
    const labelFontSize = parseFloat(window.getComputedStyle(groupElement).getPropertyValue('--vis-graph-node-label-font-size')) || 12
    const labelMargin = LABEL_RECT_VERTICAL_PADDING + 1.25 * labelFontSize ** 1.03
    const nodeHeight = isCustomXml((getString(d, nodeShape)) as Shape) ? nodeBBox.height : getNodeSize(d, nodeSize)
    label.attr('transform', `translate(0, ${nodeHeight / 2 + labelMargin})`)
    if (scale >= ZoomLevel.Level3) setLabelRect(label, getString(d, nodeLabel), nodeSelectors.labelText)

    // Bottom Icon
    bottomIcon.html(d => {
      return getString(d, nodeBottomIcon)
    })
      .attr('transform', `translate(0, ${nodeHeight / 2})`)
  })

  updateSelectedNodes(selection, config)

  return smartTransition(selection, duration)
    .attr('transform', d => `translate(${getX(d)}, ${getY(d)}) scale(1)`)
    .attr('opacity', 1)
}

export function removeNodes<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, GraphNode<N, L>>,
  config: GraphConfig<N, L>,
  duration: number
): void {
  smartTransition(selection, duration / 2)
    .attr('opacity', 0)
    .attr('transform', d => {
      const configuredPosition = getValue<GraphNode<N, L>, [number, number] | undefined>(d, config.nodeExitPosition)
      const scale = getNumber(d, config.nodeExitScale) ?? 0
      const x = configuredPosition?.[0] ?? getX(d)
      const y = configuredPosition?.[1] ?? getY(d)
      return `translate(${x}, ${y}) scale(${scale})`
    })
    .remove()
}

function setLabelBackgroundRect<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, GraphNode<N, L>>,
  config: GraphConfig<N, L>
): void {
  const { nodeLabel } = config

  selection.each((d, i, elements) => {
    const group: Selection<SVGGElement, N, SVGGElement, N> = select(elements[i])
    const label: Selection<SVGGElement, N, SVGGElement, N> = group.select(`.${nodeSelectors.label}`)
    setLabelRect(label, getString(d, nodeLabel), nodeSelectors.labelText)
  })
}

const setLabelBackgroundRectThrottled = throttle(setLabelBackgroundRect, 1000)

export function zoomNodes<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, GraphNode<N, L>>,
  config: GraphConfig<N, L>,
  scale: number
): void {
  selection.classed(generalSelectors.zoomOutLevel1, scale < ZoomLevel.Level1)
  selection.classed(generalSelectors.zoomOutLevel2, scale < ZoomLevel.Level2)

  selection.selectAll(`${nodeSelectors.sideLabelBackground}`)
    .attr('transform', `scale(${1 / Math.pow(scale, 0.35)})`)
  selection.selectAll(`.${nodeSelectors.sideLabel}`)
    .attr('transform', `scale(${1 / Math.pow(scale, 0.45)})`)

  if (scale >= ZoomLevel.Level3) selection.call(setLabelBackgroundRectThrottled, config)
}

export const zoomNodesThrottled = throttle(zoomNodes, 500)
