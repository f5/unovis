// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'
import { Transition } from 'd3-transition'
import { arc } from 'd3-shape'

// Type
import { SHAPE } from 'types/shape'
import { NodeDatumCore, LinkDatumCore, CircleLabel } from 'types/graph'

// Utils
import { trimText } from 'utils/text'
import { polygon } from 'utils/path'
import { smartTransition } from 'utils/d3'
import { getValue, throttle } from 'utils/data'

// Config
import { GraphConfigInterface } from '../../config'

// Helpers
import { arcTween, polyTween, setLabelRect, getX, getY, getSideTexLabelColor, getNodeColor, getNodeIconColor, getNodeSize, LABEL_RECT_VERTICAL_PADDING } from './helper'
import { appendShape, updateShape, isCustomXml } from '../shape'
import ZOOM_LEVEL from '../zoom-levels'

// Styles
import * as generalSelectors from '../../style'
import * as nodeSelectors from './style'

const SIDE_LABLE_SIZE = 10

export function createNodes<N extends NodeDatumCore, L extends LinkDatumCore> (selection: Selection<SVGGElement, N, SVGGElement, N[]>, config: GraphConfigInterface<N, L>): void {
  const { nodeShape } = config

  selection.each((d, i, elements) => {
    const element = elements[i]
    const group = select(element)
    group
      .attr('transform', d => `rotate(0) translate(${getX(d)}, ${getY(d)}) scale(0)`)

    group.append('circle').attr('class', nodeSelectors.nodeSelection)

    const shape = getValue(d, nodeShape)
    /** Todo: The 'nodeShape' storing logic below it a temporary fix, needs a cleaner implementation */
    // eslint-disable-next-line dot-notation
    element['nodeShape'] = shape
    group.call(appendShape, shape, nodeSelectors.node, nodeSelectors.customNode)
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
  })
}

export function updateSelectedNodes<N extends NodeDatumCore, L extends LinkDatumCore> (selection: Selection<SVGGElement, N, SVGGElement, N[]>, config: GraphConfigInterface<N, L>): void {
  const { nodeDisabled } = config

  selection.each((d, i, elements) => {
    const group: Selection<SVGGElement, N, SVGGElement, N> = select(elements[i])
    const isGreyout = getValue(d, nodeDisabled) || d._state.greyout

    group.classed(nodeSelectors.greyoutNode, isGreyout)
      .classed(nodeSelectors.draggable, !config.disableDrag)

    const nodeSelection: Selection<SVGGElement, N, SVGGElement, N> = group.selectAll(`.${nodeSelectors.nodeSelection}`)
    nodeSelection.classed(nodeSelectors.nodeSelectionActive, d._state.selected)

    group.selectAll(`.${nodeSelectors.sideLabel}`)
      .style('fill', (l: CircleLabel) => isGreyout ? null : getSideTexLabelColor(l))

    group.selectAll(`.${nodeSelectors.sideLabelBackground}`)
      .style('fill', (l: CircleLabel) => isGreyout ? null : l.color)
  })
}

export function updateNodes<N extends NodeDatumCore, L extends LinkDatumCore> (selection: Selection<SVGGElement, N, SVGGElement, N[]>, config: GraphConfigInterface<N, L>, duration: number, scale = 1): Selection<SVGGElement, N, SVGGElement, N[]> | Transition<SVGGElement, N, SVGGElement, N[]> {
  const { scoreAnimDuration, nodeBorderWidth, nodeShape, nodeSize, nodeStrokeSegmentValue, nodeStrokeSegmentFill, nodeIcon, nodeIconSize, nodeLabel, nodeSubLabel, nodeSideLabels, nodeStroke, nodeFill } = config

  // Re-create node to update shapes if they were changes
  selection.each((d, i, elements) => {
    const element = elements[i]
    const group = select(element)
    const shape = getValue(d, nodeShape)

    // eslint-disable-next-line dot-notation
    if (element['nodeShape'] !== shape) {
      group.select(`.${nodeSelectors.node}`).remove()
      group.call(appendShape, nodeShape, nodeSelectors.node, nodeSelectors.customNode, `.${nodeSelectors.nodeSelection}`)
      // eslint-disable-next-line dot-notation
      element['nodeShape'] = shape
    }
  })

  // Update nodes themselves
  selection.each((d, i, elements) => {
    const groupElement = elements[i]
    const group: Selection<SVGGElement, N, SVGGElement, N> = select(groupElement)
    const node: Selection<SVGGElement, N, SVGGElement, N> = group.select(`.${nodeSelectors.node}`)
    const nodeArc = group.select(`.${nodeSelectors.nodeArc}`)
    const icon = group.select(`.${nodeSelectors.nodeIcon}`)
    const sideLabelsGroup = group.select(`.${nodeSelectors.sideLabelsGroup}`)
    const label: Selection<SVGGElement, N, SVGGElement, N> = group.select(`.${nodeSelectors.label}`)
    const labelTextContent = label.select(`.${nodeSelectors.labelTextContent}`)
    const sublabelTextContent = label.select(`.${nodeSelectors.subLabelTextContent}`)
    const nodeSelection = group.select(`.${nodeSelectors.nodeSelection}`)

    group
      .classed(generalSelectors.zoomOutLevel2, scale < ZOOM_LEVEL.LEVEL2)
      .classed(nodeSelectors.nodeIsDragged, (d: NodeDatumCore) => d._state.isDragged)

    // Update Group
    group
      .classed(nodeSelectors.nodePolygon, d => {
        const shape = getValue(d, nodeShape)
        return shape === SHAPE.TRIANGLE || shape === SHAPE.HEXAGON || shape === SHAPE.SQUARE
      })

    // Update Node
    node
      .call(updateShape, nodeShape, nodeSize)
      .attr('stroke-width', d => getValue(d, nodeBorderWidth) ?? 0)
      .style('fill', d => getNodeColor(d, nodeFill))
      .style('stroke', d => getValue(d, nodeStroke) ?? null)

    const nodeBBox = (node.node() as SVGGraphicsElement).getBBox()

    const arcGenerator = arc<N>()
      .innerRadius(d => getNodeSize(d, nodeSize) / 2 - (getValue(d, nodeBorderWidth) / 2))
      .outerRadius(d => getNodeSize(d, nodeSize) / 2 + (getValue(d, nodeBorderWidth) / 2))
      .startAngle(0 * (Math.PI / 180))
      // eslint-disable-next-line dot-notation
      .endAngle(a => a['endAngle'])

    nodeArc
      .attr('stroke-width', d => getValue(d, nodeBorderWidth))
      .style('display', d => !getValue(d, nodeStrokeSegmentValue) ? 'none' : null)
      .style('fill', getNodeColor(d, nodeStrokeSegmentFill))
      .style('stroke', getNodeColor(d, nodeStrokeSegmentFill))
      .style('stroke-opacity', d => getValue(d, nodeShape) === SHAPE.CIRCLE ? 0 : null)

    nodeArc
      .transition()
      .duration(scoreAnimDuration)
      .attrTween('d', (d, i, arr) => {
        switch (getValue(d, nodeShape)) {
          case SHAPE.CIRCLE: return arcTween(d, config, arcGenerator, arr[i])
          case SHAPE.HEXAGON: return polyTween(d, config, polygon, arr[i])
          case SHAPE.SQUARE: return polyTween(d, config, polygon, arr[i])
          case SHAPE.TRIANGLE: return polyTween(d, config, polygon, arr[i])
          default: return null
        }
      })

    // Set Node Selection
    const selectionPadding = 12
    nodeSelection
      .attr('r', getNodeSize(d, nodeSize) / 2 + selectionPadding)

    // Update Node Icon
    icon
      .style('font-size', d => `${getValue(d, nodeIconSize) ?? 2.5 * Math.sqrt(getNodeSize(d, nodeSize))}px`)
      .attr('dy', 1)
      .style('fill', d => getNodeIconColor(d, nodeFill))
      .html(d => getValue(d, nodeIcon))

    // Side Labels
    const sideLabelsData = getValue(d, nodeSideLabels) || []
    const sideLabels = sideLabelsGroup.selectAll('g').data(sideLabelsData as CircleLabel[])
    const sideLabelsEnter = sideLabels.enter().append('g')
      .attr('class', nodeSelectors.sideLabelGroup)
    sideLabelsEnter.append('circle')
      .attr('class', nodeSelectors.sideLabelBackground)
      .attr('r', SIDE_LABLE_SIZE)
    sideLabelsEnter.append('text')
      .attr('class', nodeSelectors.sideLabel)

    const sideLabelsUpdate = sideLabels.merge(sideLabelsEnter)
    // Side label text
    sideLabelsUpdate.select(`.${nodeSelectors.sideLabel}`).text(d => d.text)
      .attr('dy', '1px')
      .style('fill', l => getSideTexLabelColor(l))
      .style('font-size', d => `${11 / Math.pow(d.text.toString().length, 0.3)}px`)
      // Side label circle background
    sideLabelsUpdate.select(`.${nodeSelectors.sideLabelBackground}`)
      .style('fill', d => d.color)

    sideLabelsUpdate.attr('transform', (l, i) => {
      if (sideLabelsData.length === 1) return `translate(${getNodeSize(d, nodeSize) / 2.5}, ${-getNodeSize(d, nodeSize) / 2.5})`
      const r = 1.05 * getNodeSize(d, nodeSize) / 2
      // const angle = i * Math.PI / 4 - Math.PI / 2
      const angle = i * 1.15 * 2 * Math.atan2(SIDE_LABLE_SIZE, r) - Math.PI / 3
      return `translate(${r * Math.cos(angle)}, ${r * Math.sin(angle)})`
    })

    sideLabels.exit().remove()

    // Set Label and Sublabel text
    const labelText = getValue(d, nodeLabel)
    const sublabelText = getValue(d, nodeSubLabel)
    const labelTextTrimmed = trimText(getValue(d, nodeLabel))
    const sublabelTextTrimmed = trimText(getValue(d, nodeSubLabel))

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
    const nodeHeight = isCustomXml(getValue(d, nodeShape)) ? nodeBBox.height : getNodeSize(d, nodeSize)
    label.attr('transform', `translate(0, ${nodeHeight / 2 + labelMargin})`)
    if (scale >= ZOOM_LEVEL.LEVEL3) setLabelRect(label, getValue(d, nodeLabel), nodeSelectors.labelText)
  })

  updateSelectedNodes(selection, config)

  return smartTransition(selection, duration)
    .attr('transform', d => `rotate(0) translate(${getX(d)}, ${getY(d)}) scale(1)`)
    .attr('opacity', 1)
}

export function removeNodes<N extends NodeDatumCore, L extends LinkDatumCore> (selection: Selection<SVGGElement, N, SVGGElement, N[]>, config: GraphConfigInterface<N, L>, duration: number): void {
  smartTransition(selection, duration / 2)
    .attr('opacity', 0)
    // .attr('transform', d => 'scale(0)')
    .remove()
}

function setLabelBackgroundRect<N extends NodeDatumCore, L extends LinkDatumCore> (selection: Selection<SVGGElement, N, SVGGElement, N[]>, config: GraphConfigInterface<N, L>): void {
  const { nodeLabel } = config

  selection.each((d, i, elements) => {
    const group: Selection<SVGGElement, N, SVGGElement, N> = select(elements[i])
    const label: Selection<SVGGElement, N, SVGGElement, N> = group.select(`.${nodeSelectors.label}`)
    setLabelRect(label, getValue(d, nodeLabel), nodeSelectors.labelText)
  })
}

const setLabelBackgroundRectThrottled = throttle(setLabelBackgroundRect, 1000)

export function zoomNodes<N extends NodeDatumCore, L extends LinkDatumCore> (selection: Selection<SVGGElement, N, SVGGElement, N[]>, config: GraphConfigInterface<N, L>, scale: number): void {
  selection.classed(generalSelectors.zoomOutLevel1, scale < ZOOM_LEVEL.LEVEL1)
  selection.classed(generalSelectors.zoomOutLevel2, scale < ZOOM_LEVEL.LEVEL2)

  selection.selectAll(`${nodeSelectors.sideLabelBackground}`)
    .attr('transform', `scale(${1 / Math.pow(scale, 0.35)})`)
  selection.selectAll(`.${nodeSelectors.sideLabel}`)
    .attr('transform', `scale(${1 / Math.pow(scale, 0.45)})`)

  if (scale >= ZOOM_LEVEL.LEVEL3) selection.call(setLabelBackgroundRectThrottled, config)
}

export const zoomNodesThrottled = throttle(zoomNodes, 500)
