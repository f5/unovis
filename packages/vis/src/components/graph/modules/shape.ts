// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'

// Types
import { SHAPE } from 'types/shape'
import { NumericAccessor, StringAccessor } from 'types/misc'

// Utils
import { polygon } from 'utils/path'
import { getValue } from 'utils/data'

// Helpers
import { getNodeSize } from './node/helper'

export function isCustomXml (shape: SHAPE): boolean {
  return /<[a-z][\s\S]*>/i.test(shape)
}

export function appendShape<T> (selection, shapeAccessor: StringAccessor<T>, shapeSelector: string, customShapeSelector: string, insertSelector = ':last-child'): void {
  selection.each((d, i, elements) => {
    const element = select(elements[i])
    const shape = getValue(d, shapeAccessor)

    let shapeElement
    const isCustomXmlShape = isCustomXml(shape)
    if (isCustomXmlShape) {
      shapeElement = element.insert('g', insertSelector)
        .html(shape)
    } else {
      switch (shape) {
      case SHAPE.SQUARE:
        shapeElement = element.insert('rect', insertSelector)
          .attr('rx', 5)
          .attr('ry', 5)
        break
      case SHAPE.HEXAGON:
      case SHAPE.TRIANGLE:
        shapeElement = element.insert('path', insertSelector)
        break
      case SHAPE.CIRCLE:
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
      switch (getValue(d, shape)) {
      case SHAPE.SQUARE:
        n = 4
        break
      case SHAPE.TRIANGLE:
        n = 3
        break
      case SHAPE.HEXAGON:
      default:
        n = 6
      }

      return polygon(nodeSize, n)
    })

  selection.filter('g')
    .filter((d: T) => !isCustomXml(getValue(d, shape)))
    .html((d: T) => getValue(d, shape))

  selection.filter('g')
    .each((d, i, elements) => {
      const el = select(elements[i])
      const bBox = el.node().getBBox()
      el.attr('transform', `translate(${-bBox.width / 2},${-bBox.height / 2})`)
    })
}
