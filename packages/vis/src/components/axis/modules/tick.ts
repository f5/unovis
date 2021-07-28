// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'

// Utils
import { wrapTextElement } from 'utils/text'
// import { isNil } from 'utils/data'

// Types
import { Position } from 'types/position'
import { VerticalAlign, FitMode, WrapTextOptions, WrapMode } from 'types/text'

// Local Types
import { AxisType } from '../types'

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

  let verticalAlign = VerticalAlign.Middle
  if (type === AxisType.X) {
    verticalAlign = position === Position.Top ? VerticalAlign.Top : VerticalAlign.Bottom
  }

  const computedSize = ticks.size() ? getComputedStyle(ticks.node())?.fontSize : null
  return {
    width: wrapWidth,
    separator: tickTextSeparator,
    wordBreak: tickTextForceWordBreak,
    length: tickTextLength,
    trimType: tickTextTrimType,
    trimOnly: tickTextFitMode === FitMode.Trim,
    dy: type === AxisType.X ? 0.71 : 0.32,
    verticalAlign,
    fitMode: tickTextFitMode,
    wrapMode: WrapMode.DOM,
    widthToHeightRatio: 0.52,
    fontSize: computedSize ? Number.parseFloat(computedSize) : 12,
  }
}
