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

export function appendShape<T> (selection, shapeAccessor: StringAccessor<T>, shapeSelector: string, customShapeSelector: string): void {
  selection.each((d, i, elements) => {
    const element = select(elements[i])
    const shape = getValue(d, shapeAccessor)

    let shapeElement
    const isCustomXmlShape = isCustomXml(shape)
    if (isCustomXmlShape) {
      shapeElement = element.append('g')
        .html(shape)
    } else {
      switch (shape) {
      case SHAPE.SQUARE:
        shapeElement = element.append('rect')
          .attr('rx', 5)
          .attr('ry', 5)
        break
      case SHAPE.HEXAGON:
      case SHAPE.TRIANGLE:
        shapeElement = element.append('path')
        break
      case SHAPE.CIRCLE:
      default:
        shapeElement = element.append('circle')
      }
    }

    shapeElement.attr('class', shapeSelector)
      .classed(customShapeSelector, isCustomXmlShape)
  })
}

export function updateShape<T> (selection, shape: StringAccessor<T>, size: NumericAccessor<T>): void {
  selection.filter('circle')
    .attr('r', (d: T) => getNodeSize(d, size) / 2)

  selection.filter('rect')
    .attr('width', (d: T) => getNodeSize(d, size))
    .attr('height', (d: T) => getNodeSize(d, size))
    .attr('x', (d: T) => -getNodeSize(d, size) / 2)
    .attr('y', (d: T) => -getNodeSize(d, size) / 2)

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

      return polygon(getNodeSize(d, size), n)
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
