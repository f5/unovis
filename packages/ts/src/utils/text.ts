import { Selection } from 'd3-selection'

// Types
import { TrimMode, VerticalAlign, WrapMode, WrapTextOptions } from 'types/text'

// Utils
import { isArray, flatten } from 'utils/data'

export function kebabCaseToCamel (str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

export function kebabCase (str: string): string {
  return str.match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)
    ?.filter(Boolean)
    .map(x => x.toLowerCase())
    .join('-')
}

export function trimTextStart (str = '', maxLength = 15): string {
  return str.length > maxLength ? `…${str.substr(str.length - maxLength, maxLength)}` : str
}

export function trimTextMiddle (str = '', maxLength = 15): string {
  const dist = Math.floor((maxLength - 3) / 2)
  return str.length > maxLength ? `${str.substr(0, dist)}…${str.substr(-dist, dist)}` : str
}

export function trimTextEnd (str = '', maxLength = 15): string {
  return str.length > maxLength ? `${str.substr(0, maxLength)}…` : str
}

export function trimText (str = '', length = 15, type = TrimMode.Middle): string {
  let result = trimTextEnd(str, length)
  if (type === TrimMode.Start) result = trimTextStart(str, length)
  else if (type === TrimMode.Middle) result = trimTextMiddle(str, length)
  return result
}

export function trimSVGTextToPixel (
  svgTextSelection: Selection<SVGTextElement, any, SVGElement, any>,
  minWidth = 50,
  trimType = TrimMode.Middle
): void {
  let i = 0
  let textBBox = svgTextSelection.node().getBBox()
  const text = svgTextSelection.text()
  let textLength = text.length

  while (textBBox.width > minWidth && textLength > 0) {
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

export function splitString (text: string, separators = [' ']): string[] {
  let result = [text] as any[]
  for (let i = 0; i < separators.length; i++) {
    const sep = separators[i]
    result.forEach((d, id) => {
      const separated = d.split(sep)
      const words = separated.map((word, j) => `${word}${j === separated.length - 1 ? '' : sep}`)
      // result.splice(i, 0, ...words)
      result[id] = words
    })
    result = flatten(result)
  }

  return result
}

export function wrapTextElement (element: Selection<SVGTextElement, any, SVGElement, any>, options: WrapTextOptions): void {
  let text = element.text()
  if (!text) return

  const {
    length,
    width,
    separator = '',
    trimType = TrimMode.End,
    verticalAlign = VerticalAlign.Middle,
    wordBreak = false,
    trimOnly = false,
    dy = 0.32,
    wrapMode,
    fontSize,
    widthToHeightRatio = 0.52,
  } = options

  // Trim text first
  if (length) text = trimText(text, length, trimType) // By the number of characters
  if (!length && trimOnly && width) { // By provided width if `trimOnly` is set
    trimSVGTextToPixel(element, width, trimType)
    return
  }

  // Wrap
  const separators = (isArray(separator) ? separator : [separator]) as string[]
  const words = splitString(text, separators)
  const x = parseFloat(element.attr('x')) || 0

  element.text('')
  let tspan = element.append('tspan').attr('x', x)
  let tspanText = `${words[0]}`
  tspan.text(tspanText)
  let tspanCount = 1

  words.forEach((word, i) => {
    if (i === 0) return
    const _text = `${tspanText}${word}`
    tspan.text(_text)
    const _wrapText = wrapMode === WrapMode.FontSize ? fontSize * _text.length * widthToHeightRatio > width
      : tspan.node().getComputedTextLength() > width
    if (_wrapText) {
      tspan.text(tspanText.trim())
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
    let numTspan
    if (wrapMode === WrapMode.FontSize) {
      numTspan = Math.ceil(tspan.text().length * fontSize * widthToHeightRatio / (width || 1))
    } else {
      numTspan = Math.ceil(tspan.node().getComputedTextLength() / (width || 1))
    }
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

  // Vertical Align
  let addY = -(tspanCount - 1) * 0.5 + dy
  if (verticalAlign === VerticalAlign.Bottom) addY = dy
  else if (verticalAlign === VerticalAlign.Top) addY = -(tspanCount - 1) - (1 - dy)
  element.attr('dy', `${addY}em`)
}

export function cutString (str: string, renderedWidth: number, maxWidth: number): [string, string] {
  const coeff = maxWidth / renderedWidth
  if (coeff >= 1) return [str, '']

  const cutIndex = Math.floor(coeff * str.length) || 1
  const head = str.substr(0, cutIndex)
  const tail = str.substr(cutIndex, str.length)

  return [head, tail]
}

export function wrapSVGText (textElement: Selection<SVGTextElement, any, SVGElement, any>, options: WrapTextOptions): void {
  const text = textElement.text()
  if (!text) return

  const {
    width,
    separator = [' ', '-', '.', ','],
  } = options

  // Wrap
  const separators = (isArray(separator) ? separator : [separator]) as string[]
  const words = splitString(text, separators)
  const x = parseFloat(textElement.attr('x')) || 0

  textElement.text('')
  let tspan = textElement.append('tspan').attr('x', x)
  let tspanContent = `${words[0]}`
  tspan.text(tspanContent)

  words.forEach((word, i) => {
    if (i === 0) return

    const tspanText = `${tspanContent}${word}`
    tspan.text(tspanText)
    const tspanWidth = tspan.node().getComputedTextLength()
    if (tspanWidth > width) {
      tspan.text(tspanContent.trim())

      tspan = textElement.append('tspan')
        .attr('x', x)
        .attr('dy', '1.2em')
        .text(word)

      tspanContent = word
    } else tspanContent += word
  })
}

export function trimSVGText (
  svgTextSelection: Selection<SVGTextElement, any, SVGElement, any>,
  maxWidth = 50,
  trimType = TrimMode.Middle,
  fastMode?: boolean,
  fontSize?: number,
  widthToHeightRatio?: number
): boolean {
  const text = svgTextSelection.text()
  const textLength = text.length

  const textWidth = fastMode ? fontSize * textLength * widthToHeightRatio : svgTextSelection.node().getComputedTextLength()
  const tolerance = 1.1
  const maxCharacters = Math.ceil(textLength * maxWidth / (tolerance * textWidth))
  if (maxCharacters < textLength) {
    svgTextSelection.text(trimText(text, maxCharacters, trimType))
    return true
  }

  return false
}

export function estimateStringPixelLength (str: string, fontSize: number, widthToHeightRatio = 0.52): number {
  return str.length * fontSize * widthToHeightRatio
}

export function estimateTextSize (
  svgTextSelection: Selection<SVGTextElement, any, SVGElement, any>,
  fontSize: number,
  dy = 0.32,
  fastMode = true,
  widthToHeightRatio = 0.52
): { width: number; height: number } {
  const tspanSelection = svgTextSelection.selectAll('tspan')

  const lines = tspanSelection.size() || 1
  const height = svgTextSelection.text() ? 0.85 * fontSize * lines * (1 + dy) - dy : 0

  let width = 0
  if (tspanSelection.empty()) {
    const textLength = svgTextSelection.text().length
    width = fastMode ? fontSize * textLength * widthToHeightRatio : svgTextSelection.node().getComputedTextLength()
  } else {
    for (const tspan of tspanSelection.nodes()) {
      const tspanTextLength = (tspan as SVGTSpanElement).textContent.length
      const w = fastMode ? fontSize * tspanTextLength * widthToHeightRatio : (tspan as SVGTSpanElement).getComputedTextLength()
      if (w > width) width = w
    }
  }

  return { width, height }
}
