import { Selection, select } from 'd3-selection'

// Types
import { NumericAccessor, StringAccessor } from 'types/accessor'

// Utils
import { polygon } from 'utils/path'
import { getString } from 'utils/data'

// Types
import { GraphInputLink, GraphInputNode } from 'types/graph'

// Local Types
import { GraphNode, GraphPanelConfigInterface, GraphNodeShape } from '../types'

// Helpers
import { getNodeSize } from './node/helper'

export function isCustomXml (shape: GraphNodeShape): boolean {
  return /<[a-z][\s\S]*>/i.test(shape)
}

export function appendShape<N extends GraphInputNode, L extends GraphInputLink, P extends GraphPanelConfigInterface> (
  selection: Selection<SVGGElement, GraphNode<N, L> | P, SVGGElement, unknown>,
  shapeAccessor: StringAccessor<GraphNode<N, L> | P>,
  shapeSelector: string,
  customShapeSelector: string,
  index?: number,
  insertSelector = ':last-child'
): void {
  selection.each((d, i, elements) => {
    const element = select(elements[i])
    const shape = getString(d, shapeAccessor, index) as GraphNodeShape

    let shapeElement
    const isCustomXmlShape = isCustomXml(shape)
    if (isCustomXmlShape) {
      shapeElement = element.insert('g', insertSelector)
        .html(shape)
    } else {
      switch (shape) {
        case GraphNodeShape.Square:
          shapeElement = element.insert('rect', insertSelector)
            .attr('rx', 5)
            .attr('ry', 5)
          break
        case GraphNodeShape.Hexagon:
        case GraphNodeShape.Triangle:
          shapeElement = element.insert('path', insertSelector)
          break
        case GraphNodeShape.Circle:
        default:
          shapeElement = element.insert('circle', insertSelector)
      }
    }

    return shapeElement.attr('class', shapeSelector)
      .classed(customShapeSelector, isCustomXmlShape)
  })
}

export function updateShape<N extends GraphInputNode, L extends GraphInputLink, P extends GraphPanelConfigInterface> (
  selection: Selection<SVGGElement, GraphNode<N, L> | P, SVGGElement, unknown>,
  shape: StringAccessor<GraphNode<N, L> | P>,
  size: NumericAccessor<GraphNode<N, L> | P>,
  index: number
): void {
  if (selection.size() === 0) return

  const d: GraphNode<N, L> | P = selection.datum()
  const nodeSize = getNodeSize(d, size, index)
  selection.filter('circle')
    .attr('r', nodeSize / 2)

  selection.filter('rect')
    .attr('width', nodeSize)
    .attr('height', nodeSize)
    .attr('x', -nodeSize / 2)
    .attr('y', -nodeSize / 2)

  selection.filter('path')
    .attr('d', () => {
      let n
      switch (getString(d, shape, index)) {
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

      return polygon(nodeSize, n)
    })

  selection.filter('g')
    .filter(() => !isCustomXml(getString(d, shape, index) as GraphNodeShape))
    .html(getString(d, shape, index))

  selection.filter('g')
    .each((d, i, elements) => {
      const el = select(elements[i])
      const bBox = el.node().getBBox()
      el.attr('transform', `translate(${-bBox.width / 2},${-bBox.height / 2})`)
    })
}
