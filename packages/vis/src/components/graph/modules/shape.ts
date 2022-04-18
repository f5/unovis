import { select } from 'd3-selection'

// Types
import { NumericAccessor, StringAccessor } from 'types/accessor'
import { Shape } from 'types/shape'

// Utils
import { polygon } from 'utils/path'
import { getString } from 'utils/data'

// Helpers
import { getNodeSize } from './node/helper'

export function isCustomXml (shape: Shape): boolean {
  return /<[a-z][\s\S]*>/i.test(shape)
}

export function appendShape<T> (selection, shapeAccessor: StringAccessor<T>, shapeSelector: string, customShapeSelector: string, insertSelector = ':last-child'): void {
  selection.each((d, i, elements) => {
    const element = select(elements[i])
    const shape = getString(d, shapeAccessor) as Shape

    let shapeElement
    const isCustomXmlShape = isCustomXml(shape)
    if (isCustomXmlShape) {
      shapeElement = element.insert('g', insertSelector)
        .html(shape)
    } else {
      switch (shape) {
        case Shape.Square:
          shapeElement = element.insert('rect', insertSelector)
            .attr('rx', 5)
            .attr('ry', 5)
          break
        case Shape.Hexagon:
        case Shape.Triangle:
          shapeElement = element.insert('path', insertSelector)
          break
        case Shape.Circle:
        default:
          shapeElement = element.insert('circle', insertSelector)
      }
    }

    return shapeElement.attr('class', shapeSelector)
      .classed(customShapeSelector, isCustomXmlShape)
  })
}

export function updateShape<T> (selection, shape: StringAccessor<T>, size: NumericAccessor<T>): void {
  if (selection.size() === 0) return

  const d: T = selection.datum()
  const nodeSize = getNodeSize(d, size)
  selection.filter('circle')
    .attr('r', (d: T) => nodeSize / 2)

  selection.filter('rect')
    .attr('width', (d: T) => nodeSize)
    .attr('height', (d: T) => nodeSize)
    .attr('x', (d: T) => -nodeSize / 2)
    .attr('y', (d: T) => -nodeSize / 2)

  selection.filter('path')
    .attr('d', (d: T) => {
      let n
      switch (getString(d, shape)) {
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

      return polygon(nodeSize, n)
    })

  selection.filter('g')
    .filter((d: T) => !isCustomXml(getString(d, shape) as Shape))
    .html((d: T) => getString(d, shape))

  selection.filter('g')
    .each((d, i, elements) => {
      const el = select(elements[i])
      const bBox = el.node().getBBox()
      el.attr('transform', `translate(${-bBox.width / 2},${-bBox.height / 2})`)
    })
}
