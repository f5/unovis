// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'

// Utils
import { wrapTextElement } from 'utils/text'
import { isNil } from 'utils/data'
import { WrapTextOptions } from 'utils/types'

// Enums
import { AxisType } from 'enums/axis'
import { Position } from 'enums/position'

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
      .classed(s.tickText, true)

    const text = textElement.text()
    const x = textElement.attr('x') ? parseFloat(textElement.attr('x')) : null
    const y = textElement.attr('y') ? parseFloat(textElement.attr('y')) : null

    textElement.call(wrapTextElement, wrapOptions, callback)

    if (wrapOptions.tickTextFitMode === 'wrap' && (isNil(wrapOptions.length) || text.length < wrapOptions.length)) return
    tickElement.select(`.${s.fullTickText}`).remove()
    const fullTextElement = tickElement.append('text').attr('class', s.fullTickText)
    fullTextElement.text(text)
    fullTextElement
      .call(wrapTextElement, fullWrapOptions)
      .attr('x', x)
      .attr('y', y)
  })
}

export function getWrapOptions (ticks, config, forceWrap?: boolean): WrapTextOptions {
  const {
    type, position, tickTextLength, tickTextWidth, tickTextSeparator, tickTextForceWordBreak,
    tickTextTrimType, tickTextFitMode, width, padding, offset,
  } = config

  let wrapWidth = tickTextWidth
  if (!wrapWidth) {
    if (type === AxisType.X) {
      wrapWidth = width / ticks.size()
    } else {
      wrapWidth = position === Position.RIGHT ? offset.right - padding.left - padding.right : offset.left
    }
  }

  let verticalAlign = 'middle'
  if (type === AxisType.X) {
    verticalAlign = position === Position.TOP ? 'top' : 'bottom'
  }

  return {
    width: wrapWidth,
    separator: tickTextSeparator,
    wordBreak: tickTextForceWordBreak,
    length: tickTextLength,
    trimType: tickTextTrimType,
    trimOnly: tickTextFitMode === 'trim',
    dy: type === AxisType.X ? 0.71 : 0.32,
    verticalAlign,
    forceWrap,
    tickTextFitMode,
  }
}
