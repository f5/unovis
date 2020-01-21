// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'

// Utils
import { wrapTextElement } from 'utils/text'
import { isNil } from 'utils/data'

// Types
import { AxisType } from 'types/axis'
import { Position } from 'types/position'
import { VerticalAlign, FitMode, WrapTextOptions } from 'types/text'

import * as s from '../style'

export function wrapTickText (selection, wrapOptions, callback): void {
  const fullWrapOptions = {
    ...wrapOptions,
    length: undefined,
    trimOnly: false,
  }
  selection.each((d, i, elements) => {
    const tickElement = select(elements[i])
    const textElement = tickElement.select('text')
      .classed('active', true)
      .classed(s.tickText, true) as Selection<SVGTextElement, any, SVGElement, any>

    const text = textElement.text()
    const x = textElement.attr('x') ? parseFloat(textElement.attr('x')) : null
    const y = textElement.attr('y') ? parseFloat(textElement.attr('y')) : null

    textElement.call(wrapTextElement, wrapOptions, callback)

    if (wrapOptions.fitMode === FitMode.WRAP && (isNil(wrapOptions.length) || text.length < wrapOptions.length)) return
    tickElement.select(`.${s.fullTickText}`).remove()
    const fullTextElement = tickElement.append('text').attr('class', s.fullTickText)
    fullTextElement.text(text)
    fullTextElement
      .call(wrapTextElement, fullWrapOptions)
      .attr('x', x)
      .attr('y', y)
  })
}

export function getWrapOptions (ticks, config, autoWrap: boolean): WrapTextOptions {
  const {
    type, position, tickTextLength, tickTextWidth, tickTextSeparator, tickTextForceWordBreak,
    tickTextTrimType, tickTextFitMode, width, padding, offset,
  } = config

  let wrapWidth
  if (tickTextWidth) {
    wrapWidth = tickTextWidth
  } else if (type === AxisType.X) {
    wrapWidth = width / ticks.size()
  } else if (autoWrap) {
    wrapWidth = position === Position.RIGHT ? offset.right - padding.left - padding.right : offset.left
  }

  let verticalAlign = VerticalAlign.MIDDLE
  if (type === AxisType.X) {
    verticalAlign = position === Position.TOP ? VerticalAlign.TOP : VerticalAlign.BOTTOM
  }

  return {
    width: wrapWidth,
    separator: tickTextSeparator,
    wordBreak: tickTextForceWordBreak,
    length: tickTextLength,
    trimType: tickTextTrimType,
    trimOnly: tickTextFitMode === FitMode.TRIM,
    dy: type === AxisType.X ? 0.71 : 0.32,
    verticalAlign,
    fitMode: tickTextFitMode,
  }
}
