import { select, Selection } from 'd3-selection'
import { Transition } from 'd3-transition'
import { arc } from 'd3-shape'

// Types
import { GraphInputLink, GraphInputNode } from 'types/graph'

// Utils
import { trimText } from 'utils/text'
import { polygon } from 'utils/path'
import { smartTransition } from 'utils/d3'
import { getBoolean, getNumber, getString, getValue, throttle } from 'utils/data'

// Local Types
import { GraphNode, GraphCircleLabel, GraphNodeAnimationState, GraphNodeAnimatedElement, GraphNodeShape } from '../../types'

// Config
import { GraphConfig } from '../../config'

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
} from './helper'
import { appendShape, updateShape, isCustomXml } from '../shape'
import { ZoomLevel } from '../zoom-levels'

// Styles
import * as generalSelectors from '../../style'
import * as nodeSelectors from './style'

const SIDE_LABEL_DEFAULT_RADIUS = 10

export function createNodes<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, GraphNode<N, L>>,
  config: GraphConfig<N, L>
): void {
  const { nodeShape } = config

  selection.each((d, i, elements) => {
    const element = elements[i]
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
    // eslint-disable-next-line dot-notation
    element['nodeShape'] = shape
    appendShape(group, shape, nodeSelectors.node, nodeSelectors.customNode, d._index)
    appendShape(group, shape, nodeSelectors.nodeSelection, nodeSelectors.customNode, d._index)
    group.append('path').attr('class', nodeSelectors.nodeGauge)
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
  selection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown>,
  config: GraphConfig<N, L>
): void {
  const { nodeDisabled } = config

  selection.each((d, i, elements) => {
    const group: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, GraphNode<N, L>> = select(elements[i])
    const isGreyout = getBoolean(d, nodeDisabled, d._index) || d._state.greyout

    group.classed(nodeSelectors.greyoutNode, isGreyout)
      .classed(nodeSelectors.draggable, !config.disableDrag)

    const nodeSelectionOutline = group.selectAll<SVGGElement, GraphNode<N, L>>(`.${nodeSelectors.nodeSelection}`)
    nodeSelectionOutline.classed(nodeSelectors.nodeSelectionActive, d._state.selected)

    group.selectAll(`.${nodeSelectors.sideLabel}`)
      .style('fill', (l: GraphCircleLabel) => isGreyout ? null : getSideLabelTextColor(l, selection.node()))

    group.selectAll(`.${nodeSelectors.sideLabelBackground}`)
      .style('fill', (l: GraphCircleLabel) => isGreyout ? null : l.color)
  })
}

export function updateNodes<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown>,
  config: GraphConfig<N, L>,
  duration: number,
  scale = 1
): Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown> | Transition<SVGGElement, GraphNode<N, L>, SVGGElement, unknown> {
  const {
    nodeGaugeAnimDuration, nodeStrokeWidth, nodeShape, nodeSize, nodeGaugeValue, nodeGaugeFill,
    nodeIcon, nodeIconSize, nodeLabel, nodeSubLabel, nodeSideLabels, nodeStroke, nodeFill, nodeBottomIcon,
  } = config

  // Re-create nodes to update shapes if they were changes
  selection.each((d, i, elements) => {
    const element = elements[i]
    const group = select<SVGGElement, GraphNode<N, L>>(element)
    const shape = getString(d, nodeShape, d._index)

    // eslint-disable-next-line dot-notation
    if (element['nodeShape'] !== shape) {
      group.select(`.${nodeSelectors.node}`).remove()
      appendShape(group, nodeShape, nodeSelectors.node, nodeSelectors.customNode, d._index, `.${nodeSelectors.nodeSelection}`)
      group.select(`.${nodeSelectors.nodeSelection}`).remove()
      appendShape(group, shape, nodeSelectors.nodeSelection, null, d._index, `.${nodeSelectors.nodeGauge}`)
      // eslint-disable-next-line dot-notation
      element['nodeShape'] = shape
    }
  })

  // Update nodes themselves
  selection.each((d, i, elements) => {
    const groupElement = elements[i]
    const group: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, GraphNode<N, L>> = select(groupElement)
    const node: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, GraphNode<N, L>> = group.select(`.${nodeSelectors.node}`)
    const nodeArc = group.select(`.${nodeSelectors.nodeGauge}`)
    const icon = group.select(`.${nodeSelectors.nodeIcon}`)
    const sideLabelsGroup = group.select(`.${nodeSelectors.sideLabelsGroup}`)
    const label: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, GraphNode<N, L>> = group.select(`.${nodeSelectors.label}`)
    const labelTextContent = label.select(`.${nodeSelectors.labelTextContent}`)
    const sublabelTextContent = label.select(`.${nodeSelectors.subLabelTextContent}`)
    const bottomIcon = group.select(`.${nodeSelectors.nodeBottomIcon}`)
    const nodeSelectionOutline = group.select<SVGGElement>(`.${nodeSelectors.nodeSelection}`)
    const nodeSizeValue = getNodeSize(d, nodeSize, d._index)
    const arcGenerator = arc<GraphNodeAnimationState>()
      .innerRadius(state => getNodeSize(state, nodeSize, state.nodeIndex) / 2 - (getNumber(state, nodeStrokeWidth, state.nodeIndex) / 2))
      .outerRadius(state => getNodeSize(state, nodeSize, state.nodeIndex) / 2 + (getNumber(state, nodeStrokeWidth, state.nodeIndex) / 2))
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
      .style('stroke', getString(d, nodeStroke, d._index) ?? null)

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
      .attrTween('d', (d, j, arr: GraphNodeAnimatedElement<SVGElement>[]) => {
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
    icon
      .style('font-size', `${getNumber(d, nodeIconSize, d._index) ?? 2.5 * Math.sqrt(nodeSizeValue)}px`)
      .attr('dy', 1)
      .style('fill', getNodeIconColor(d, nodeFill, d._index, selection.node()))
      .html(getString(d, nodeIcon, d._index))

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
      .attr('dy', '1px')
      .style('fill', l => getSideLabelTextColor(l, selection.node()))
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
    const labelTextTrimmed = trimText(labelText)
    const sublabelTextTrimmed = trimText(sublabelText)

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
  config: GraphConfig<N, L>,
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
  config: GraphConfig<N, L>
): void {
  const { nodeLabel } = config

  selection.each((d, i, elements) => {
    const group: Selection<SVGGElement, N, SVGGElement, N> = select(elements[i])
    const label: Selection<SVGGElement, N, SVGGElement, N> = group.select(`.${nodeSelectors.label}`)
    setLabelRect(label, getString(d, nodeLabel, i), nodeSelectors.labelText)
  })
}

const setLabelBackgroundRectThrottled = throttle(setLabelBackgroundRect, 1000)

export function zoomNodes<N extends GraphInputNode, L extends GraphInputLink> (
  selection: Selection<SVGGElement, GraphNode<N, L>, SVGGElement, unknown>,
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
