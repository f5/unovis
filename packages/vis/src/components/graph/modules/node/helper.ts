import { Selection, BaseType } from 'd3-selection'
import { interpolate } from 'd3-interpolate'
import { max, mean } from 'd3-array'
import { Arc } from 'd3-shape'
import { color } from 'd3-color'

// Types
import { NumericAccessor } from 'types/accessor'
import { Shape } from 'types/shape'
import { GraphInputLink, GraphInputNode } from 'types/graph'

// Utils
import { scoreRectPath } from 'utils/path'
import { isEmpty, isNil, getNumber, getString } from 'utils/data'
import { getColor, hexToBrightness } from 'utils/color'

// Local Types
import { GraphNode, GraphCircleLabel, GraphNodeAnimatedElement, GraphNodeAnimationState } from '../../types'

// Config
import { GraphConfigInterface } from '../../config'

export const NODE_SIZE = 30
export const LABEL_RECT_HORIZONTAL_PADDING = 10
export const LABEL_RECT_VERTICAL_PADDING = 4

export function getNodeSize<T> (d: T, nodeSizeAccessor: NumericAccessor<T>): number {
  return getNumber(d, nodeSizeAccessor) || NODE_SIZE
}

function _setInitialAnimState (el: GraphNodeAnimatedElement<SVGElement>): void {
  el._animState = {
    endAngle: 0,
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
  const { nodeBorderWidth, nodeSize, nodeStrokeSegmentValue } = config
  if (!el._animState) _setInitialAnimState(el)

  const i = interpolate(el._animState, {
    endAngle: 2 * Math.PI * (getNumber(d, nodeStrokeSegmentValue) ?? 0) / 100,
    nodeSize: getNodeSize(d, nodeSize),
    borderWidth: getNumber(d, nodeBorderWidth),
  })
  el._animState = i(0)

  return (t: number): string => {
    el._animState = i(t)
    return arcConstructor(el._animState)
  }
}

export function polyTween<N extends GraphInputNode, L extends GraphInputLink> (
  d: GraphNode<N, L>,
  config: GraphConfigInterface<N, L>, polygonConstructor,
  el: GraphNodeAnimatedElement<SVGElement>
): (t: number) => string {
  const { nodeShape, nodeStrokeSegmentValue } = config
  const nodeSize = getNodeSize(d, config.nodeSize)
  let n: number
  switch (getString(d, nodeShape)) {
    case Shape.Square:
      n = 4
      break
    case Shape.Triangle:
      n = 3
      break
    case Shape.Hexagon:
    default:
      n = 6
  }

  if (!el._animState) _setInitialAnimState(el)
  const i = interpolate(el._animState, {
    endAngle: 2 * Math.PI * (getNumber(d, nodeStrokeSegmentValue) ?? 0) / 100,
  })
  el._animState = i(0)

  return (t: number): string => {
    el._animState = i(t)
    return n === 4 ? scoreRectPath({ x: -nodeSize / 2, y: -nodeSize / 2, w: nodeSize, h: nodeSize, r: 5, score: el._animState.endAngle / (2 * Math.PI) }) : polygonConstructor(nodeSize, n, el._animState.endAngle, true)
  }
}

export function setLabelRect<A> (
  labelSelection: Selection<BaseType, A, SVGGElement, A>,
  label: string,
  selector: string
): Selection<BaseType, A, SVGGElement, A> {
  // Set label background rectangle size by text size
  const labelIsEmpty = isEmpty(label)
  const labelTextSelection = labelSelection.select(`.${selector}`)
  const labelTextBBox = (labelTextSelection.node() as SVGGraphicsElement).getBBox()
  const backgroundRect = labelSelection.select('rect')
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
  return max(data || [], d => getNodeSize(d, nodeSize)) || NODE_SIZE
}

export function getAverageNodeSize<T> (data: T[], nodeSize: NumericAccessor<T>): number {
  return mean(data || [], d => getNodeSize(d, nodeSize)) || NODE_SIZE
}

export function getSideTexLabelColor (label: GraphCircleLabel): string {
  if (!label.color) return null

  const hex = color(label.color).hex()
  const brightness = hexToBrightness(hex)
  return brightness > 0.65 ? 'var(--vis-graph-node-side-label-fill-color-dark)' : 'var(--vis-graph-node-side-label-fill-color-bright)'
}

export function getNodeColor<T> (d: T, colorAccessor): string {
  return getColor(d, colorAccessor) ?? null
}

export function getNodeIconColor<T> (d: T, colorAccessor): string {
  const nodeColor = getNodeColor(d, colorAccessor)
  if (!nodeColor) return null

  const hex = color(nodeColor).hex()
  const brightness = hexToBrightness(hex)
  return brightness > 0.65 ? 'var(--vis-graph-node-icon-fill-color-dark)' : 'var(--vis-graph-node-icon-fill-color-bright)'
}
