import { select, Selection } from 'd3-selection'
import { Transition } from 'd3-transition'
import { arc } from 'd3-shape'

// Types
import { GraphInputLink, GraphInputNode } from 'types/graph'
import { TrimMode } from 'types/text'

// Utils
import { trimString } from 'utils/text'
import { polygon } from 'utils/path'
import { smartTransition } from 'utils/d3'
import { getBoolean, getNumber, getString, getValue, throttle } from 'utils/data'
import { getColor } from 'utils/color'

// Local Types
import { GraphNode, GraphCircleLabel, GraphNodeAnimationState, GraphNodeAnimatedElement, GraphNodeShape } from '../../types'

// Config
import { GraphConfigInterface } from '../../config'

// Helpers
import {
  arcTween,
  polyTween,
  setLabelRect,
  getX,
  getY,
  getSideLabelTextColor,
  getNodeColor,
  getNodeIconColor,
  getNodeSize,
  LABEL_RECT_VERTICAL_PADDING,
  isInternalHref,
} from './helper'
import { appendShape, updateShape, isCustomXml } from '../shape'
import { ZoomLevel } from '../zoom-levels'

// Styles
import * as generalSelectors from '../../style'
import * as nodeSelectors from './style'

const SIDE_LABEL_DEFAULT_RADIUS = 10

export interface GraphNodeSVGGElement extends SVGGElement {
  nodeShape?: string;
}

export function createNodes<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown>,
  config: GraphConfigInterface<N, L>
): void {
  const { nodeShape } = config

  selection.each((d, i, elements) => {
    const element = elements[i] as GraphNodeSVGGElement
    const group = select<SVGGElement, GraphNode<N, L>>(element)
    group
      .attr('transform', (d: GraphNode<N, L>, i) => {
        const configuredPosition = getValue<GraphNode<N, L>, [number, number] | undefined>(d, config.nodeEnterPosition, i)
        const scale = getNumber(d, config.nodeEnterScale, i) ?? 0
        const x = configuredPosition?.[0] ?? getX(d)
        const y = configuredPosition?.[1] ?? getY(d)
        return `translate(${x}, ${y}) scale(${scale})`
      })
      .attr('opacity', 0)

    const shape = getString(d, nodeShape, d._index)
    /** Todo: The 'nodeShape' storing logic below it a temporary fix, needs a cleaner implementation */
    element.nodeShape = shape
    appendShape(group, shape, nodeSelectors.node, nodeSelectors.customNode, d._index)
    appendShape(group, shape, nodeSelectors.nodeSelection, nodeSelectors.customNode, d._index)
    group.append('path').attr('class', nodeSelectors.nodeGauge)
    group.append('g').attr('class', nodeSelectors.nodeIcon)

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
  selection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown>,
  config: GraphConfigInterface<N, L>
): void {
  const { nodeDisabled } = config

  selection.each((d, i, elements) => {
    const group: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown> = select(elements[i])
    const isGreyout = getBoolean(d, nodeDisabled, d._index) || d._state.greyout

    group.classed(nodeSelectors.greyoutNode, isGreyout)
      .classed(nodeSelectors.draggable, !config.disableDrag)

    const nodeSelectionOutline = group.selectAll<SVGGElement, GraphNode<N, L>>(`.${nodeSelectors.nodeSelection}`)
    nodeSelectionOutline.classed(nodeSelectors.nodeSelectionActive, d._state.selected)

    group.selectAll<SVGTextElement, GraphCircleLabel>(`.${nodeSelectors.sideLabel}`)
      .style('fill', (l) => isGreyout ? null : getSideLabelTextColor(l, selection.node()))

    group.selectAll<SVGRectElement, GraphCircleLabel>(`.${nodeSelectors.sideLabelBackground}`)
      .style('fill', (l) => isGreyout ? null : l.color)
  })
}

export function updateNodes<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown>,
  config: GraphConfigInterface<N, L>,
  duration: number,
  scale = 1
): Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown> | Transition<SVGGElement, GraphNode<N, L>, SVGGElement, unknown> {
  const {
    nodeGaugeAnimDuration, nodeStrokeWidth, nodeShape, nodeSize, nodeGaugeValue, nodeGaugeFill,
    nodeIcon, nodeIconSize, nodeLabel, nodeLabelTrim, nodeLabelTrimMode, nodeLabelTrimLength,
    nodeSubLabel, nodeSubLabelTrim, nodeSubLabelTrimMode, nodeSubLabelTrimLength,
    nodeSideLabels, nodeStroke, nodeFill, nodeBottomIcon,
  } = config

  // Re-create nodes to update shapes if they were changes
  selection.each((d, i, elements) => {
    const element = elements[i] as GraphNodeSVGGElement
    const group = select<SVGGElement, GraphNode<N, L>>(element)
    const shape = getString(d, nodeShape, d._index)

    if (element.nodeShape !== shape) {
      group.select(`.${nodeSelectors.node}`).remove()
      appendShape(group, nodeShape, nodeSelectors.node, nodeSelectors.customNode, d._index, `.${nodeSelectors.nodeSelection}`)
      group.select(`.${nodeSelectors.nodeSelection}`).remove()
      appendShape(group, shape, nodeSelectors.nodeSelection, null, d._index, `.${nodeSelectors.nodeGauge}`)
      element.nodeShape = shape
    }
  })

  // Update nodes themselves
  selection.each((d, i, elements) => {
    const groupElement = elements[i]
    const group: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown> = select(groupElement)
    const node: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown> = group.select(`.${nodeSelectors.node}`)
    const nodeArc = group.select<GraphNodeAnimatedElement<SVGElement>>(`.${nodeSelectors.nodeGauge}`)
    const icon = group.select<SVGTextElement>(`.${nodeSelectors.nodeIcon}`)
    const sideLabelsGroup = group.select<SVGGElement>(`.${nodeSelectors.sideLabelsGroup}`)
    const label = group.select<SVGGElement>(`.${nodeSelectors.label}`)
    const labelTextContent = label.select<SVGTextElement>(`.${nodeSelectors.labelTextContent}`)
    const sublabelTextContent = label.select<SVGTextElement>(`.${nodeSelectors.subLabelTextContent}`)
    const bottomIcon = group.select<SVGTextElement>(`.${nodeSelectors.nodeBottomIcon}`)
    const nodeSelectionOutline = group.select<SVGGElement>(`.${nodeSelectors.nodeSelection}`)
    const nodeSizeValue = getNodeSize(d, nodeSize, d._index)
    const arcGenerator = arc<GraphNodeAnimationState>()
      .innerRadius(state => state.nodeSize / 2 - state.borderWidth / 2)
      .outerRadius(state => state.nodeSize / 2 + state.borderWidth / 2)
      .startAngle(0 * (Math.PI / 180))
      // eslint-disable-next-line dot-notation
      .endAngle(a => a['endAngle'])

    group
      .classed(generalSelectors.zoomOutLevel2, scale < ZoomLevel.Level2)
      .classed(nodeSelectors.nodeIsDragged, (d: GraphNode<N, L>) => d._state.isDragged)

    // Update Group
    group
      .classed(nodeSelectors.nodePolygon, () => {
        const shape = getString(d, nodeShape, d._index)
        return shape === GraphNodeShape.Triangle || shape === GraphNodeShape.Hexagon || shape === GraphNodeShape.Square
      })

    // Update Node
    node
      .call(updateShape, nodeShape, nodeSize, d._index)
      .attr('stroke-width', getNumber(d, nodeStrokeWidth, d._index) ?? 0)
      .style('fill', getNodeColor(d, nodeFill, d._index))
      .style('stroke', getColor(d, nodeStroke, d._index, true) ?? null)

    const nodeBBox = (node.node() as SVGGraphicsElement).getBBox()

    nodeArc
      .attr('stroke-width', getNumber(d, nodeStrokeWidth, d._index))
      .style('display', !getNumber(d, nodeGaugeValue, d._index) ? 'none' : null)
      .style('fill', getNodeColor(d, nodeGaugeFill, d._index))
      .style('stroke', getNodeColor(d, nodeGaugeFill, d._index))
      .style('stroke-opacity', d => getString(d, nodeShape, d._index) === GraphNodeShape.Circle ? 0 : null)

    nodeArc
      .transition()
      .duration(nodeGaugeAnimDuration)
      .attrTween('d', (
        d,
        j,
        arr
      ) => {
        switch (getString(d, nodeShape, d._index)) {
          case GraphNodeShape.Circle: return arcTween(d, config, arcGenerator, arr[j])
          case GraphNodeShape.Hexagon: return polyTween(d, config, polygon, arr[j])
          case GraphNodeShape.Square: return polyTween(d, config, polygon, arr[j])
          case GraphNodeShape.Triangle: return polyTween(d, config, polygon, arr[j])
          default: return null
        }
      })

    // Set Node Selection
    updateShape(nodeSelectionOutline, nodeShape, nodeSize, d._index)

    // Update Node Icon
    const nodeIconContent = getString(d, nodeIcon, d._index)
    const nodeIconSizeValue = getNumber(d, nodeIconSize, d._index) ?? 2.5 * Math.sqrt(nodeSizeValue)
    const nodeIconColor = getNodeIconColor(d, nodeFill, d._index, selection.node())
    icon.selectAll('*').remove() // Removing all children first
    if (isInternalHref(nodeIconContent)) { // If the icon is a href, we need to append a <use> element and render the icon with it
      icon.append('use')
        .attr('href', nodeIconContent)
        .attr('x', -nodeIconSizeValue / 2)
        .attr('y', -nodeIconSizeValue / 2)
        .attr('width', nodeIconSizeValue)
        .attr('height', nodeIconSizeValue)
        .style('fill', nodeIconColor)
    } else { // If the icon is a text, we need to append a <text> element and render the icon as text
      icon
        .append('text')
        .style('font-size', `${nodeIconSizeValue}px`)
        .attr('dy', '0.1em')
        .style('fill', nodeIconColor)
        .html(nodeIconContent)
    }

    // Side Labels
    const sideLabelsData = getValue<GraphNode<N, L>, GraphCircleLabel[]>(d, nodeSideLabels, d._index) || []
    const sideLabels = sideLabelsGroup.selectAll<SVGGElement, GraphCircleLabel>('g').data(sideLabelsData)
    const sideLabelsEnter = sideLabels.enter().append('g')
      .attr('class', nodeSelectors.sideLabelGroup)
    sideLabelsEnter.append('circle')
      .attr('class', nodeSelectors.sideLabelBackground)
      .attr('r', l => l.radius ?? SIDE_LABEL_DEFAULT_RADIUS)
    sideLabelsEnter.append('text')
      .attr('class', nodeSelectors.sideLabel)

    const sideLabelsUpdate = sideLabels.merge(sideLabelsEnter)
      .style('cursor', l => l.cursor ?? null)

    // Side label text
    sideLabelsUpdate.select(`.${nodeSelectors.sideLabel}`).html(d => d.text)
      .attr('dy', '0.1em')
      .style('fill', l => l.textColor ?? getSideLabelTextColor(l, selection.node()))
      .style('font-size', l => l.fontSize ?? `${(2 + (l.radius ?? SIDE_LABEL_DEFAULT_RADIUS)) / Math.pow(l.text.toString().length, 0.3)}px`)
      // Side label circle background
    sideLabelsUpdate.select(`.${nodeSelectors.sideLabelBackground}`)
      .style('fill', l => l.color)

    sideLabelsUpdate.attr('transform', (l, j) => {
      if (sideLabelsData.length === 1) return `translate(${nodeSizeValue / 2.5}, ${-nodeSizeValue / 2.5})`
      const r = 1.05 * nodeSizeValue / 2
      const angle = j * 1.15 * 2 * Math.atan2(l.radius ?? SIDE_LABEL_DEFAULT_RADIUS, r) - Math.PI / 3
      return `translate(${r * Math.cos(angle)}, ${r * Math.sin(angle)})`
    })

    sideLabels.exit().remove()

    // Set label and sub-label text
    const labelText = getString(d, nodeLabel, d._index)
    const sublabelText = getString(d, nodeSubLabel, d._index)
    const labelTextTrimmed = getBoolean(d, nodeLabelTrim, d._index)
      ? trimString(labelText, getNumber(d, nodeLabelTrimLength, d._index), getValue(d, nodeLabelTrimMode as TrimMode, d._index))
      : labelText
    const sublabelTextTrimmed = getBoolean(d, nodeSubLabelTrim, d._index)
      ? trimString(sublabelText, getNumber(d, nodeSubLabelTrimLength, d._index), getValue(d, nodeSubLabelTrimMode as TrimMode, d._index))
      : sublabelText

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
    const nodeHeight = isCustomXml((getString(d, nodeShape, d._index)) as GraphNodeShape) ? nodeBBox.height : nodeSizeValue
    label.attr('transform', `translate(0, ${nodeHeight / 2 + labelMargin})`)
    if (scale >= ZoomLevel.Level3) setLabelRect(label, getString(d, nodeLabel, d._index), nodeSelectors.labelText)

    // Bottom Icon
    bottomIcon.html(getString(d, nodeBottomIcon, d._index))
      .attr('transform', `translate(0, ${nodeHeight / 2})`)
  })

  updateSelectedNodes(selection, config)

  return smartTransition(selection, duration)
    .attr('transform', d => `translate(${getX(d)}, ${getY(d)}) scale(1)`)
    .attr('opacity', 1)
}

export function removeNodes<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown>,
  config: GraphConfigInterface<N, L>,
  duration: number
): void {
  smartTransition(selection, duration / 2)
    .attr('opacity', 0)
    .attr('transform', (d, i) => {
      const configuredPosition = getValue<GraphNode<N, L>, [number, number] | undefined>(d, config.nodeExitPosition, i)
      const scale = getNumber(d, config.nodeExitScale, i) ?? 0
      const x = configuredPosition?.[0] ?? getX(d)
      const y = configuredPosition?.[1] ?? getY(d)
      return `translate(${x}, ${y}) scale(${scale})`
    })
    .remove()
}

function setLabelBackgroundRect<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown>,
  config: GraphConfigInterface<N, L>
): void {
  const { nodeLabel } = config

  selection.each((d, i, elements) => {
    const group: Selection<SVGGElement, N, SVGGElement, N> = select(elements[i])
    const label: Selection<SVGGElement, N, SVGGElement, N> = group.select(`.${nodeSelectors.label}`)
    setLabelRect(label, getString(d, nodeLabel, i), nodeSelectors.labelText)
  })
}

const setLabelBackgroundRectThrottled = throttle(setLabelBackgroundRect, 1000) as typeof setLabelBackgroundRect

export function zoomNodes<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown>,
  config: GraphConfigInterface<N, L>,
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
