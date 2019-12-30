// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'
import { wrapTextElement } from 'utils/text'
import { isNil } from 'utils/data'
import * as s from '../style'

export function wrapTickText (selection, wrapOptions, callback) {
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
