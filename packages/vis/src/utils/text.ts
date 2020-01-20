// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection } from 'd3-selection'

// Types
import { TrimMode, VerticalAlign, WrapTextOptions } from 'types/text'

// Utils
import { isArray, flatten } from 'utils/data'

export function trimTextStart (str = '', maxLength = 15): string {
  return str.length > maxLength ? `...${str.substr(0, maxLength)}` : str
}

export function trimTextMiddle (str = '', maxLength = 15): string {
  const dist = Math.floor((maxLength - 3) / 2)
  return str.length > maxLength ? `${str.substr(0, dist)}...${str.substr(-dist, dist)}` : str
}

export function trimTextEnd (str = '', maxLength = 15): string {
  return str.length > maxLength ? `${str.substr(0, maxLength)}...` : str
}

export function trimText (str = '', length = 15, type = TrimMode.MIDDLE): string {
  let result = trimTextEnd(str, length)
  if (type === TrimMode.START) result = trimTextStart(str, length)
  else if (type === TrimMode.MIDDLE) result = trimTextMiddle(str, length)
  return result
}

export function trimSVGTextToPixel (svgTextSelection: Selection<SVGTextElement, any, SVGElement, any>, minWidth = 50, trimType = TrimMode.MIDDLE): void {
  let i = 0
  let textBBox = svgTextSelection.node().getBBox()
  let text = svgTextSelection.text()
  let textLength = text.length
  while (textBBox.width > minWidth && textLength > 0) {
    text = svgTextSelection.text()
    textLength -= 1
    svgTextSelection.text(trimText(text, text.length - i, trimType))
    i = i + 1
    textBBox = svgTextSelection.node().getBBox()
  }
}

export function breakTspan (tspan: Selection<SVGTSpanElement, any, SVGElement, any>, width: number, word = ''): string {
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

export function splitString (text: string, separators = [' ']) {
  let result = [text] as any[]
  for (let i = 0; i < separators.length; i++) {
    const sep = separators[i]
    result.forEach(d => {
      const separated = d.split(sep)
      const words = separated.map((word, i) => `${word}${i === separated.length - 1 ? '' : sep}`)
      // result.splice(i, 0, ...words)
      result[i] = words
    })
    result = flatten(result)
  }

  return result
}

export function wrapTextElement (element, options: WrapTextOptions): void {
  let text = element.text()
  if (!text) return
  const {
    length,
    width,
    separator = '',
    trimType = TrimMode.END,
    verticalAlign = VerticalAlign.MIDDLE,
    wordBreak = false,
    trimOnly = false,
    dy = 0.32,
  } = options
  if (length) text = trimText(text, length, trimType)
  if (!length && trimOnly && width) {
    trimSVGTextToPixel(element, width, trimType)
    return
  }
  const separators = (isArray(separator) ? separator : [separator]) as string[]
  const words = splitString(text, separators)
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
    const numTspan = Math.ceil(tspan.node().getComputedTextLength() / (width || 1))
    for (let i = 0; i < numTspan; i++) {
      const word = breakTspan(tspan, width || 1)
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
  if (verticalAlign === VerticalAlign.BOTTOM) addY = dy
  else if (verticalAlign === VerticalAlign.TOP) addY = -(tspanCount - 1) - (1 - dy)
  element.attr('dy', `${addY}em`)
}
