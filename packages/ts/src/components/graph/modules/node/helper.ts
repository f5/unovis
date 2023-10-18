import { BaseType, Selection } from 'd3-selection'
import { interpolate } from 'd3-interpolate'
import { max, mean } from 'd3-array'
import { Arc } from 'd3-shape'

// Types
import { ColorAccessor, NumericAccessor } from 'types/accessor'
import { GraphInputLink, GraphInputNode } from 'types/graph'

// Utils
import { scoreRectPath } from 'utils/path'
import { isEmpty, isNil, getNumber, getString } from 'utils/data'
import { getColor, getHexValue, hexToBrightness } from 'utils/color'

// Local Types
import { GraphNode, GraphCircleLabel, GraphNodeAnimatedElement, GraphNodeAnimationState, GraphNodeShape } from '../../types'

// Config
import { GraphConfigInterface } from '../../config'

export const NODE_SIZE = 30
export const LABEL_RECT_HORIZONTAL_PADDING = 10
export const LABEL_RECT_VERTICAL_PADDING = 4

export function getNodeSize<T> (d: T, nodeSizeAccessor: NumericAccessor<T>, index: number): number {
  return getNumber(d, nodeSizeAccessor, index) || NODE_SIZE
}

function _setInitialAnimState (el: GraphNodeAnimatedElement<SVGElement>, index: number): void {
  el._animState = {
    endAngle: 0,
    nodeIndex: index,
  }
}

// Animate the arc around node with keeping
// the current anim state info
export function arcTween<N extends GraphInputNode, L extends GraphInputLink> (
  d: GraphNode<N, L>,
  config: GraphConfigInterface<N, L>,
  arcConstructor: Arc<any, GraphNodeAnimationState>,
  el: GraphNodeAnimatedElement<SVGElement>
): (t: number) => string {
  const { nodeStrokeWidth, nodeSize, nodeGaugeValue } = config
  if (!el._animState) _setInitialAnimState(el, d._index)

  const i = interpolate(el._animState, {
    endAngle: 2 * Math.PI * (getNumber(d, nodeGaugeValue, d._index) ?? 0) / 100,
    nodeIndex: d._index,
    nodeSize: getNodeSize(d, nodeSize, d._index),
    borderWidth: getNumber(d, nodeStrokeWidth, d._index),
  })
  el._animState = i(0)

  return (t: number): string => {
    el._animState = i(t)
    return arcConstructor(el._animState)
  }
}

export function polyTween<N extends GraphInputNode, L extends GraphInputLink> (
  d: GraphNode<N, L>,
  config: GraphConfigInterface<N, L>,
  polygonConstructor: (nodeSize: number, nEdges?: number, endAngle?: number, isOpen?: boolean) => string,
  el: GraphNodeAnimatedElement<SVGElement>
): (t: number) => string {
  const { nodeShape, nodeGaugeValue } = config
  const nodeSize = getNodeSize(d, config.nodeSize, d._index)
  let n: number
  switch (getString(d, nodeShape, d._index)) {
    case GraphNodeShape.Square:
      n = 4
      break
    case GraphNodeShape.Triangle:
      n = 3
      break
    case GraphNodeShape.Hexagon:
    default:
      n = 6
  }

  if (!el._animState) _setInitialAnimState(el, d._index)
  const i = interpolate(el._animState, {
    endAngle: 2 * Math.PI * (getNumber(d, nodeGaugeValue, d._index) ?? 0) / 100,
    nodeIndex: d._index,
  })
  el._animState = i(0)

  return (t: number): string => {
    el._animState = i(t)
    return n === 4 ? scoreRectPath({
      x: -nodeSize / 2,
      y: -nodeSize / 2,
      w: nodeSize,
      h: nodeSize,
      r: 5,
      score: el._animState.endAngle / (2 * Math.PI),
    }) : polygonConstructor(nodeSize, n, el._animState.endAngle, true)
  }
}

export function setLabelRect<T, K extends BaseType, L> (
  labelSelection: Selection<SVGGElement, T, K, L>,
  label: string,
  selector: string
): Selection<SVGRectElement, T, K, L> {
  // Set label background rectangle size by text size
  const labelIsEmpty = isEmpty(label)
  const labelTextSelection = labelSelection.select<SVGTextElement>(`.${selector}`)
  const labelTextBBox = (labelTextSelection.node() as SVGGraphicsElement).getBBox()
  const backgroundRect = labelSelection.select<SVGRectElement>('rect')
    .attr('visibility', labelIsEmpty ? 'hidden' : null)
    .attr('rx', 4)
    .attr('ry', 4)
    .attr('x', -labelTextBBox.width / 2 - LABEL_RECT_HORIZONTAL_PADDING)
    .attr('y', '-0.64em')
    .attr('width', labelTextBBox.width + 2 * LABEL_RECT_HORIZONTAL_PADDING)
    .attr('height', labelTextBBox.height + 2 * LABEL_RECT_VERTICAL_PADDING)
    .style('transform', `translateY(${-LABEL_RECT_VERTICAL_PADDING}px)`)

  return backgroundRect
}

export function getX (node: GraphNode): number {
  return node._state && !isNil(node._state.fx) ? node._state.fx : node.x
}

export function getY (node: GraphNode): number {
  return node._state && !isNil(node._state.fy) ? node._state.fy : node.y
}

export function configuredNodeSize<T> (nodeSizeAccessor: NumericAccessor<T>): number {
  return typeof nodeSizeAccessor === 'number' ? nodeSizeAccessor : NODE_SIZE
}

export function getMaxNodeSize<T> (data: T[], nodeSize: NumericAccessor<T>): number {
  return max(data || [], (d, i) => getNodeSize(d, nodeSize, i)) || NODE_SIZE
}

export function getAverageNodeSize<T> (data: T[], nodeSize: NumericAccessor<T>): number {
  return mean(data || [], (d, i) => getNodeSize(d, nodeSize, i)) || NODE_SIZE
}

export function getSideLabelTextColor (label: GraphCircleLabel, context: SVGElement): string {
  if (!label.color) return null

  const hex = getHexValue(label.color, context)
  const brightness = hexToBrightness(hex)
  return brightness > 0.65 ? 'var(--vis-graph-node-side-label-fill-color-dark)' : 'var(--vis-graph-node-side-label-fill-color-bright)'
}

export function getNodeColor<T> (d: T, colorAccessor: ColorAccessor<T>, index: number): string {
  return getColor(d, colorAccessor, index, true) ?? null
}

export function getNodeIconColor<T> (d: T, colorAccessor: ColorAccessor<T>, index: number, context: SVGElement): string {
  const nodeColor = getNodeColor(d, colorAccessor, index)
  if (!nodeColor) return null

  const hex = getHexValue(nodeColor, context)
  const brightness = hexToBrightness(hex)
  return brightness > 0.65 ? 'var(--vis-graph-node-icon-fill-color-dark)' : 'var(--vis-graph-node-icon-fill-color-bright)'
}
