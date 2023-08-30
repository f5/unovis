import { Selection } from 'd3-selection'
import { sum } from 'd3-array'
import striptags from 'striptags'

// Types
import { TextAlign, TrimMode, UnovisText, UnovisTextFrameOptions, UnovisTextOptions, UnovisWrappedText, VerticalAlign } from 'types/text'

// Utils
import { flatten, isArray, merge } from 'utils/data'
import { getTextAnchorFromTextAlign } from 'types/svg'

// Styles
import { getFontWidthToHeightRatio, UNOVIS_TEXT_DEFAULT, UNOVIS_TEXT_SEPARATOR_DEFAULT, UNOVIS_TEXT_HYPHEN_CHARACTER_DEFAULT } from 'styles/index'
import { ScaleDimension } from '../../lib'

/**
 * Converts a kebab-case string to camelCase.
 *
 * @param {string} str - The kebab-case string to be converted.
 * @returns {string} The resulting camelCase string.
 */
export function kebabCaseToCamel (str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Converts a given string to kebab-case.
 * @param {string} str - The input string to be converted to kebab-case.
 * @returns {string} - The kebab-cased string.
 */
export function kebabCase (str: string): string {
  return str.match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)
    ?.filter(Boolean)
    .map(x => x.toLowerCase())
    .join('-')
}

/**
 * Trims the input string from the start, leaving only the specified maximum length.
 * @param {string} [str=''] - The input string to be trimmed.
 * @param {number} [maxLength=15] - The maximum allowed length of the trimmed string.
 * @returns {string} - The trimmed string.
 */
export function trimStringStart (str = '', maxLength = 15): string {
  return str.length > maxLength ? `…${str.substr(str.length - maxLength, maxLength)}` : str
}

/**
 * Trims the input string from the middle, leaving only the specified maximum length.
 * @param {string} [str=''] - The input string to be trimmed.
 * @param {number} [maxLength=15] - The maximum allowed length of the trimmed string.
 * @returns {string} - The trimmed string.
 */
export function trimStringMiddle (str = '', maxLength = 15): string {
  const dist = Math.floor((maxLength - 3) / 2)
  return str.length > maxLength ? `${str.substr(0, dist)}…${str.substr(-dist, dist)}` : str
}

/**
 * Trims the input string from the end, leaving only the specified maximum length.
 * @param {string} [str=''] - The input string to be trimmed.
 * @param {number} [maxLength=15] - The maximum allowed length of the trimmed string.
 * @returns {string} - The trimmed string.
 */
export function trimStringEnd (str = '', maxLength = 15): string {
  return str.length > maxLength ? `${str.substr(0, maxLength)}…` : str
}

/**
 * Trims the input string according to the specified trim mode.
 * @param {string} [str=''] - The input string to be trimmed.
 * @param {number} [length=15] - The maximum allowed length of the trimmed string.
 * @param {TrimMode} [type=TrimMode.Middle] - The trim mode to be applied.
 * @returns {string} - The trimmed string.
 */
export function trimString (str = '', length = 15, type = TrimMode.Middle): string {
  let result = trimStringEnd(str, length)
  if (type === TrimMode.Start) result = trimStringStart(str, length)
  else if (type === TrimMode.Middle) result = trimStringMiddle(str, length)
  return result
}

/**
 * Splits the input string according to the specified separators.
 * @param {string} text - The input string to be split.
 * @param {string[]} [separators=[' ']] - The array of separators to be used for splitting.
 * @returns {string[]} - The array of split words.
 */
export function splitString (text: string, separators = [' ']): string[] {
  let result = [text] as any[]
  for (let i = 0; i < separators.length; i++) {
    const sep = separators[i]
    result.forEach((d, id) => {
      const separated = d.split(sep)
      const words = separated.map((word, j) => `${word}${j === separated.length - 1 ? '' : sep}`)
      result[id] = words
    })
    result = flatten(result)
  }

  return result
}

/**
 * Wraps an SVG text element to fit within the specified width.
 * @param {Selection<SVGTextElement, any, SVGElement, any>} textElement - The SVG text element to be wrapped.
 * @param {number} width - The maximum allowed width for the text element.
 * @param {(string | string[])} [separator=[' ', '-', '.', ',']] - The separator(s) to be used for wrapping.
 */
export function wrapSVGText (
  textElement: Selection<SVGTextElement, any, SVGElement, any>,
  width: number,
  separator: string | string[] = [' ', '-', '.', ',']
): void {
  const text = textElement.text()
  if (!text) return

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

/**
 * Trims an SVG text element based on the specified max width, trim type, and other options.
 * @param {Selection<SVGTextElement, any, SVGElement, any>} svgTextSelection - The D3 selection of the SVG text element to be trimmed.
 * @param {number} [maxWidth=50] - The maximum width of the text element.
 * @param {TrimMode} [trimType=TrimMode.Middle] - The type of trim (start, middle, or end).
 * @param {boolean} [fastMode=true] - Whether to use a fast estimation method for text length calculation.
 * @param {number} [fontSize=0] - The font size of the text.
 * @param {number} [fontWidthToHeightRatio=getFontWidthToHeightRatio()] - The font width to height ratio.
 * @returns {boolean} True if the text was trimmed, false otherwise.
 */
export function trimSVGText (
  svgTextSelection: Selection<SVGTextElement, any, SVGElement, any>,
  maxWidth = 50,
  trimType = TrimMode.Middle,
  fastMode = true,
  fontSize = +window.getComputedStyle(svgTextSelection.node())?.fontSize || 0,
  fontWidthToHeightRatio = getFontWidthToHeightRatio()
): boolean {
  const text = svgTextSelection.text()
  const textLength = text.length

  const textWidth = fastMode ? fontSize * textLength * fontWidthToHeightRatio : svgTextSelection.node().getComputedTextLength()
  const tolerance = 1.1
  const maxCharacters = Math.ceil(textLength * maxWidth / (tolerance * textWidth))
  if (maxCharacters < textLength) {
    svgTextSelection.text(trimString(text, maxCharacters, trimType))
    return true
  }

  return false
}

/**
 * Estimates the length of a string in pixels.
 * @param {string} str - The string to be measured.
 * @param {number} fontSize - The font size of the string.
 * @param {number} [fontWidthToHeightRatio=getFontWidthToHeightRatio()] - The font width to height ratio.
 * @returns {number} The estimated length of the string in pixels.
 */
export function estimateStringPixelLength (
  str: string,
  fontSize: number,
  fontWidthToHeightRatio = getFontWidthToHeightRatio()
): number {
  return str.length * fontSize * fontWidthToHeightRatio || 0
}

/**
 * Calculates the precise length of a string in pixels.
 * @param {string} str - The string to be measured.
 * @param {string} [fontFamily] - The font family of the string.
 * @param {(string | number)} [fontSize] - The font size of the string.
 * @returns {number} The precise length of the string in pixels.
 */
export function getPreciseStringLengthPx (str: string, fontFamily?: string, fontSize?: string | number): number {
  const svgNS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(svgNS, 'svg')
  const text = document.createElementNS(svgNS, 'text')

  text.textContent = str
  text.setAttribute('font-size', `${fontSize}`)
  text.setAttribute('font-family', fontFamily)

  svg.appendChild(text)
  document.body.appendChild(svg)
  const length = text.getComputedTextLength()
  document.body.removeChild(svg)

  return length
}

/**
 * Estimates the dimensions of an SVG text element.
 *
 * @export
 * @param {Selection<SVGTextElement, any, SVGElement, any>} svgTextSelection - The D3 selection of the SVG text element.
 * @param {number} fontSize - The font size.
 * @param {number} [dy=0.32] - The line height scaling factor.
 * @param {boolean} [fastMode=true] - Whether to use a fast estimation method or a more accurate one.
 * @param {number} [fontWidthToHeightRatio] - The font width-to-height ratio.
 * @returns {{width: number, height: number}} - The estimated dimensions of the text element.
 */
export function estimateTextSize (
  svgTextSelection: Selection<SVGTextElement, any, SVGElement, any>,
  fontSize: number,
  dy = 0.32,
  fastMode = true,
  fontWidthToHeightRatio?: number
): { width: number; height: number } {
  fontWidthToHeightRatio = fontWidthToHeightRatio || getFontWidthToHeightRatio()
  const tspanSelection = svgTextSelection.selectAll('tspan')

  const lines = tspanSelection.size() || 1
  const height = svgTextSelection.text() ? 0.85 * fontSize * lines * (1 + dy) - dy : 0

  let width = 0
  if (tspanSelection.empty()) {
    const textLength = svgTextSelection.text().length
    width = fastMode ? fontSize * textLength * fontWidthToHeightRatio : svgTextSelection.node().getComputedTextLength()
  } else {
    for (const tspan of tspanSelection.nodes()) {
      const tspanTextLength = (tspan as SVGTSpanElement).textContent.length
      const w = fastMode ? fontSize * tspanTextLength * fontWidthToHeightRatio : (tspan as SVGTSpanElement).getComputedTextLength()
      if (w > width) width = w
    }
  }

  return { width, height }
}

/**
 * Breaks a text block into lines based on the specified width.
 *
 * @param {UnovisText} textBlock - The text block to break into lines.
 * @param {number | undefined} [width=undefined] - The maximum width of a line in pixels.
 * @param {(number | undefined)} [height=undefined] - The height limit for the wrapped text in pixels.
 * @param {boolean} [fastMode=true] - Whether to use a fast estimation method or a more accurate one.
 * @param {string | string[]} [separator] - The word separators.
 * @returns {string[]} - The text split into lines.
 */
function breakTextIntoLines (
  textBlock: UnovisText,
  width: number | undefined = undefined,
  fastMode = true,
  separator: string | string[] = UNOVIS_TEXT_SEPARATOR_DEFAULT,
  wordBreak = false
): string[] {
  const text = `${textBlock.text}`
  if (!text) return []
  const separators = Array.isArray(separator) ? separator : [separator]

  const splitByNewLine = text.split('\n')
  return splitByNewLine.map((str) => {
    const lines: string[] = []
    if (!width) return [str]

    const words = splitString(str, separators)
    let line = ''
    for (let i = 0; i < words.length; i += 1) {
      const textLengthPx = fastMode
        ? estimateStringPixelLength(line + words[i], textBlock.fontSize, textBlock.fontWidthToHeightRatio)
        : getPreciseStringLengthPx(line + words[i], textBlock.fontFamily, textBlock.fontSize)

      if (textLengthPx < width || i === 0) {
        line += words[i]
      } else {
        lines.push(line.trim())
        line = words[i]
      }

      // Word break functionality
      const minCharactersOnLine = 2
      if (wordBreak) {
        while (line.trim().length > minCharactersOnLine) {
          const subLineLengthPx = fastMode
            ? estimateStringPixelLength(line, textBlock.fontSize, textBlock.fontWidthToHeightRatio)
            : getPreciseStringLengthPx(line, textBlock.fontFamily, textBlock.fontSize)

          if (subLineLengthPx > width) {
            let breakIndex = (line.trim()).length - minCharactersOnLine // Place at least `minCharactersOnLine` characters onto the next line
            while (breakIndex > 0) {
              const subLine = `${line.substring(0, breakIndex)}${UNOVIS_TEXT_HYPHEN_CHARACTER_DEFAULT}` // Use hyphen when force breaking words
              const subLinePx = fastMode
                ? estimateStringPixelLength(subLine, textBlock.fontSize, textBlock.fontWidthToHeightRatio)
                : getPreciseStringLengthPx(subLine, textBlock.fontFamily, textBlock.fontSize)

              // If the subline is less than the width, or just one character left, break the line
              if (subLinePx <= width || breakIndex === 1) {
                lines.push(subLine.trim())
                line = line.substring(breakIndex)
                break
              }
              breakIndex--
            }
          } else {
            break
          }
        }
      }
    }

    // Adding the final line after the loop
    if (line) lines.push(line.trim())

    return lines
  }).flat()
}

/**
 * Wraps a text or array of texts to fit within specified width and height, if provided.
 *
 * @export
 * @param {UnovisText | UnovisText[]} text - The text or array of texts to wrap.
 * @param {number | undefined} [width=undefined] - The maximum width of a line in pixels.
 * @param {boolean} [fastMode=true] - Whether to use a fast estimation method or a more accurate one.
 * @param {string | string[]} [separator] - The word separators.
 * @returns {UnovisWrappedText[]} - The wrapped texts.
 */
export function getWrappedText (
  text: UnovisText | UnovisText[],
  width: number | undefined = undefined,
  height: number | undefined = undefined,
  fastMode = true,
  separator: string | string[] = UNOVIS_TEXT_SEPARATOR_DEFAULT,
  wordBreak = false
): UnovisWrappedText[] {
  // Merge input text with default values and convert it to an array if it's not already
  const textArrays = Array.isArray(text) ? text.map(t => merge(UNOVIS_TEXT_DEFAULT, t)) : [merge(UNOVIS_TEXT_DEFAULT, text)]

  // Break input text into lines based on width and separator
  const textWrapped: Array<string[]> = textArrays.map(block => breakTextIntoLines(block, width, fastMode, separator, wordBreak))

  const firstBlock = textArrays[0]
  let h = -firstBlock.fontSize * (firstBlock.lineHeight - 1)
  const blocks: UnovisWrappedText[] = []

  // Process each text block and its lines based on height limit
  textArrays.forEach((text, i) => {
    let lines = textWrapped[i]

    const prevBlock = i > 0 ? blocks[i - 1] : undefined
    const prevBlockMarginBottomPx = prevBlock ? prevBlock.marginBottom : 0
    const marginTopPx = text.marginTop
    const effectiveMarginPx = Math.max(prevBlockMarginBottomPx, marginTopPx)

    h += effectiveMarginPx
    const dh = text.fontSize * text.lineHeight
    // Iterate over lines and handle text overflow based on the height limit if provided
    for (let k = 0; k < lines.length; k += 1) {
      let line = lines[k]
      h += dh

      if (height && (h + dh) > height && (k !== lines.length - 1)) {
        // Remove hyphen character from the end of the line if it's there
        const lastCharacter = line.charAt(line.length - 1)
        if (lastCharacter === UNOVIS_TEXT_HYPHEN_CHARACTER_DEFAULT) {
          line = line.substr(0, lines[k].length - 1)
        }

        const lineWithEllipsis = `${line} …`
        const textLengthPx = fastMode
          ? estimateStringPixelLength(lineWithEllipsis, text.fontSize, text.fontWidthToHeightRatio)
          : getPreciseStringLengthPx(lineWithEllipsis, text.fontFamily, text.fontSize)

        if (textLengthPx < width) {
          lines[k] = lineWithEllipsis
        } else {
          lines[k] = `${lines[k].substr(0, lines[k].length - 2)}…`
        }

        lines = lines.slice(0, k + 1)
        break
      }
    }

    // Create wrapped text block with its calculated properties
    blocks.push({ ...text, _lines: lines, _estimatedHeight: h - (prevBlock?._estimatedHeight || 0) })
  })

  return blocks
}


/**
 * Renders a text or array of texts to SVG tspan strings.
 *
 * @param {UnovisWrappedText[]} blocks - The wrapped text blocks.
 * @param {number} [x=0] - The x-coordinate for the tspan elements.
 * @param {number} [y] - The y-coordinate for the tspan elements.
 * @returns {string[]} - The SVG tspan strings.
 */
function renderTextToTspanStrings (blocks: UnovisWrappedText[], x = 0, y?: number): string[] {
  return blocks.map((b, i) => {
    const prevBlock = i > 0 ? blocks[i - 1] : undefined
    const prevBlockMarginBottomEm = prevBlock ? prevBlock.marginBottom / prevBlock.fontSize : 0
    const marginTopEm = b.marginTop / b.fontSize
    const marginEm = Math.max(prevBlockMarginBottomEm, marginTopEm)
    const attributes = {
      fontSize: b.fontSize,
      fontFamily: b.fontFamily,
      fill: b.color,
      y: (i === 0) && y,
    }

    const attributesString = Object.entries(attributes)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${kebabCase(key)}="${escape(value.toString())}"`)
      .join(' ')

    return `<tspan xmlns="http://www.w3.org/2000/svg" ${attributesString}>${b._lines.map((line, k) => {
      let dy: number
      if (i === 0 && k === 0) dy = 0.8 + marginEm
      else if (k === 0) dy = marginEm + b.lineHeight
      else dy = b.lineHeight

      return `<tspan x="${x}" dy="${dy}em">${line.length ? line : ' '}</tspan>`
    }).join('')}</tspan>`
  })
}

/**
 * Estimates the height of wrapped text blocks.
 *
 * @export
 * @param {UnovisWrappedText[]} blocks - The wrapped text blocks.
 * @returns {number} - The estimated height of the wrapped text blocks.
 */
export function estimateWrappedTextHeight (blocks: UnovisWrappedText[]): number {
  return sum(blocks, b => b._estimatedHeight)
}

export const allowedSvgTextTags = ['text', 'tspan', 'textPath', 'altGlyph', 'altGlyphDef', 'altGlyphItem', 'glyphRef', 'textRef', 'textArea']
/**
 * Renders a text or array of texts to an SVG text element.
 * Calling this function will replace the contents of the specified SVG text element.
 *
 * @export
 * @param {SVGTextElement} textElement - The SVG text element to render the text into.
 * @param {UnovisText | UnovisText[]} text - The text or array of texts to render.
 * @param {UnovisTextOptions} options - The text options.
 */
export function renderTextToSvgTextElement (
  textElement: SVGTextElement,
  text: UnovisText | UnovisText[],
  options: UnovisTextOptions
): void {
  const wrappedText = getWrappedText(text, options.width, undefined, options.fastMode, options.separator, options.wordBreak)
  const textElementX = +textElement.getAttribute('x')
  const textElementY = +textElement.getAttribute('y')
  const x = textElementX ?? 0
  let y = textElementY ?? 0
  if (options.textAlign) textElement.setAttribute('text-anchor', getTextAnchorFromTextAlign(options.textAlign))
  if (options.verticalAlign && options.verticalAlign !== VerticalAlign.Top) {
    const height = estimateWrappedTextHeight(wrappedText)
    const dy = options.verticalAlign === VerticalAlign.Middle ? -height / 2
      : options.verticalAlign === VerticalAlign.Bottom ? -height : 0

    y += dy
  }

  const parser = new DOMParser()
  textElement.textContent = ''
  wrappedText.forEach(block => {
    const svgCode = renderTextToTspanStrings([block], x, y).join('')
    const svgCodeSanitized = striptags(svgCode, allowedSvgTextTags)
    const parsedSvgCode = parser.parseFromString(svgCodeSanitized, 'image/svg+xml').firstChild
    textElement.appendChild(parsedSvgCode)
  })
}

/**
 * Renders a text or array of texts into a frame.
 * Calling this function will replace the contents of the specified SVG group.
 *
 * @export
 * @param {SVGGElement} group - The SVG group element to render the text into.
 * @param {UnovisText | UnovisText[]} text - The text or array of texts to render.
 * @param {UnovisTextFrameOptions} frameOptions - The text frame options.
 */
export function renderTextIntoFrame (
  group: SVGGElement,
  text: UnovisText | UnovisText[],
  frameOptions: UnovisTextFrameOptions
): void {
  const wrappedText = getWrappedText(text, frameOptions.width, frameOptions.height, frameOptions.fastMode, frameOptions.separator, frameOptions.wordBreak)

  const x = frameOptions.textAlign === TextAlign.Center ? frameOptions.width / 2
    : frameOptions.textAlign === TextAlign.Right ? frameOptions.width : 0

  let y = 0
  const height = estimateWrappedTextHeight(wrappedText)
  if (frameOptions.height && height < frameOptions.height) {
    const height = estimateWrappedTextHeight(wrappedText)
    const dh = frameOptions.height - height
    y = frameOptions.verticalAlign === VerticalAlign.Middle ? dh / 2
      : frameOptions.verticalAlign === VerticalAlign.Bottom ? dh : 0
  }

  const translate = (frameOptions.x || frameOptions.y)
    ? `transform="translate(${frameOptions.x ?? 0},${frameOptions.y ?? 0})"`
    : ''

  const svgCode =
  `<text
    xmlns="http://www.w3.org/2000/svg"
    text-anchor="${getTextAnchorFromTextAlign(frameOptions.textAlign)}"
    ${translate}
  >
    ${renderTextToTspanStrings(wrappedText, x, y).join('')}
  </text>`

  const parser = new DOMParser()
  const svgCodeSanitized = striptags(svgCode, allowedSvgTextTags)
  const parsedSvgCode = parser.parseFromString(svgCodeSanitized, 'image/svg+xml').firstChild

  group.textContent = ''
  group.appendChild(parsedSvgCode)
}

export function getAriaDescriptionForXYChart (xDataExtent: number[], yDataExtent: number[] = [], chartType: string, tickFormat = _ => _): string {
  let description = ''

  if (yDataExtent[0] === undefined && yDataExtent[1] === undefined) {
    description += 'The extent of its Y dimension is undefined. '
  } else {
    description += `The smallest value among the ${chartType} is ${yDataExtent[0]?.toFixed(2)}, the largest ${yDataExtent[1]?.toFixed(2)}. `
  }
  return `${description}`
}
