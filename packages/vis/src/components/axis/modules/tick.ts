import { select, Selection } from 'd3-selection'

// Utils
import { wrapTextElement } from 'utils/text'

// Types
import { Position } from 'types/position'
import { VerticalAlign, FitMode, WrapTextOptions, WrapMode } from 'types/text'

// Config
import { AxisConfig } from '../config'

// Local Types
import { AxisType } from '../types'

import * as s from '../style'

export function wrapTickText (selection: Selection<SVGTextElement, unknown, SVGGElement, unknown>, wrapOptions: WrapTextOptions): void {
  selection.each((d, i, elements) => {
    const textElement = select(elements[i]) as Selection<SVGTextElement, unknown, SVGGElement, unknown>
    textElement
      .classed(s.tickText, true)
      .call(wrapTextElement, wrapOptions)
  })
}

export function getWrapOptions<Datum> (
  ticks: Selection<SVGGElement, unknown, SVGGElement, unknown>,
  config: AxisConfig<Datum>,
  width: number
): WrapTextOptions {
  const {
    type, position, tickTextLength, tickTextWidth, tickTextSeparator, tickTextForceWordBreak,
    tickTextTrimType, tickTextFitMode,
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

  const computedSize = ticks.size() ? window.getComputedStyle(ticks.node())?.fontSize : null
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
