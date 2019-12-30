// Copyright (c) Volterra, Inc. All rights reserved.
import { isArray, flatten } from 'utils/data'
import { WrapTextOptions } from 'utils/types'

export function trimTextStart (str = '', maxLength = 15) {
  return str.length > maxLength ? `...${str.substr(0, maxLength)}` : str
}

export function trimTextMiddle (str = '', maxLength = 15) {
  const dist = Math.floor((maxLength - 3) / 2)
  return str.length > maxLength ? `${str.substr(0, dist)}...${str.substr(-dist, dist)}` : str
}

export function trimTextEnd (str = '', maxLength = 15) {
  return str.length > maxLength ? `${str.substr(0, maxLength)}...` : str
}

export function trimText (str = '', length = 15, type = 'middle') {
  let result = trimTextEnd(str, length)
  if (type === 'start') result = trimTextStart(str, length)
  else if (type === 'middle') result = trimTextMiddle(str, length)
  return result
}

export function trimToPixel (svgTextElement: any, minWidth = 50, trimType = 'middle') {
  let i = 0
  let textBBox = svgTextElement.node().getBBox()
  let text = svgTextElement.text()
  let textLength = text.length
  while (textBBox.width > minWidth && textLength > 0) {
    text = svgTextElement.text()
    textLength -= 1
    svgTextElement.text(trimText(text, text.length - i, trimType))
    i = i + 1
    textBBox = svgTextElement.node().getBBox()
  }
}

export function breakTspan (tspan: any, width: number, word = '') {
  const tspanText = tspan.text()
  const coeff = width / tspan.node().getComputedTextLength()
  if (coeff < 1) {
    const cutIndex = Math.floor(coeff * tspanText.length) || 1
    const head = tspanText.substr(0, cutIndex)
    const tail = tspanText.substr(cutIndex, tspanText.length)
    tspan.text(head)
    return `${tail}${word}`
  } else {
    return word
  }
}

export function splitTextByMultipleSeparators (text, separators = [' ']) {
  let result = [text]
  for (let i = 0; i < separators.length; i++) {
    const separator = separators[i]
    result.forEach((d, i) => {
      const separated = d.split(separator)
      result[i] = separated.map((word, i) => `${word}${i === separated.length - 1 ? '' : separator}`)
    })
    result = flatten(result)
  }

  return result
}

export function wrap (element: any, { length, width = 200, separator = '', trimType = 'end', verticalAlign = 'middle', wordBreak = false, trimOnly = false, dy = 0.32 }: WrapTextOptions = {}): void {
  let text = element.text()
  if (length) text = trimText(text, length, trimType)
  if (!length && trimOnly) {
    trimToPixel(element, width, trimType)
    return
  }
  const separators = (isArray(separator) ? separator : [separator]) as string[]
  const words = splitTextByMultipleSeparators(text, separators)
  const x = parseFloat(element.attr('x')) || 0
  element.text('')
  let tspan = element.append('tspan').attr('x', x)
  let tspanText = `${words[0]}`
  let tspanCount = 1
  tspan.text(tspanText)
  words.forEach((word, i) => {
    if (i === 0) return
    tspan.text(`${tspanText}${word}`)
    if (tspan.node().getComputedTextLength() > width) {
      tspan.text(tspanText)
      if (wordBreak) word = breakTspan(tspan, width, word)
      tspan = element.append('tspan')
        .attr('x', x)
        .attr('dy', '1.2em')
        .text(word)
      tspanCount += 1
      tspanText = word
    } else tspanText += word
  })

  if (wordBreak) {
    const numTspan = Math.ceil(tspan.node().getComputedTextLength() / width)
    for (let i = 0; i < numTspan; i++) {
      const word = breakTspan(tspan, width)
      if (word) {
        tspan = element.append('tspan')
          .attr('x', x)
          .attr('dy', '1.2em')
          .text(word)
        tspanCount += 1
      }
    }
  }

  let addY = -(tspanCount - 1) * 0.5 + dy
  if (verticalAlign === 'bottom') addY = dy
  else if (verticalAlign === 'top') addY = -(tspanCount - 1) - (1 - dy)
  element.attr('dy', `${addY}em`)
}

export function wrapTextElement (element, options, callback) {
  if (!element.text()) return
  if (options.forceWrap) {
    wrap(element, options)
    callback?.()
  }
  (document as any).fonts.ready.then(() => {
    wrap(element, options)
    callback?.()
  })
}
