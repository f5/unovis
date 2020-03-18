// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'

// Utils
import { wrapTextElement } from 'utils/text'
// import { isNil } from 'utils/data'

// Types
import { AxisType } from 'types/axis'
import { Position } from 'types/position'
import { VerticalAlign, FitMode, WrapTextOptions } from 'types/text'

import * as s from '../style'

export function wrapTickText (selection, wrapOptions): void {
  selection.each((d, i, elements) => {
    const textElement = select(elements[i]) as Selection<SVGTextElement, any, SVGElement, any>
    textElement
      .classed(s.tickText, true)
      .call(wrapTextElement, wrapOptions)
  })
}

export function getWrapOptions (ticks, config): WrapTextOptions {
  const {
    type, position, tickTextLength, tickTextWidth, tickTextSeparator, tickTextForceWordBreak,
    tickTextTrimType, tickTextFitMode, width,
  } = config

  let wrapWidth
  if (tickTextWidth) {
    wrapWidth = tickTextWidth
  } else if (type === AxisType.X) {
    wrapWidth = width / ticks.size()
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
