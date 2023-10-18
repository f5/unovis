import { Selection, select } from 'd3-selection'

// Types
import { NumericAccessor, StringAccessor } from 'types/accessor'

// Utils
import { polygon } from 'utils/path'
import { getString } from 'utils/data'

// Types

// Local Types
import { GraphNodeShape } from '../types'

// Helpers
import { getNodeSize } from './node/helper'

export function isCustomXml (shape: GraphNodeShape): boolean {
  return /<[a-z][\s\S]*>/i.test(shape)
}

export function appendShape<T> (
  selection: Selection<SVGGElement, T, SVGGElement, unknown>,
  shapeAccessor: StringAccessor<T>,
  shapeSelector: string,
  customShapeSelector: string,
  index?: number,
  insertSelector = ':last-child'
): void {
  selection.each((d, i, elements) => {
    const element = select(elements[i])
    const shape = getString(d, shapeAccessor, index) as GraphNodeShape

    let shapeElement: Selection<SVGPathElement, unknown, null, undefined>
    | Selection<SVGRectElement, unknown, null, undefined>
    | Selection<SVGGElement, unknown, null, undefined>
    | Selection<SVGCircleElement, unknown, null, undefined>
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

    shapeElement.classed(customShapeSelector, isCustomXmlShape)
    return shapeElement.attr('class', shapeSelector)
  })
}

export function updateShape<T> (
  selection: Selection<SVGGElement, T, SVGGElement, unknown>,
  shape: StringAccessor<T>,
  size: NumericAccessor<T>,
  index: number
): void {
  if (selection.size() === 0) return

  const d: T = selection.datum()
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
      let n: number
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
