// Styles
import { UNOVIS_TEXT_DEFAULT_FONT_SIZE, getFontWidthToHeightRatio } from '@/styles'

// Types
import { UnovisFontInfo } from '@/types/text'

// Utils
import { addToCache } from '@/utils/cache'
import { toPx } from '@/utils/to-px'

const UNOVIS_TEXT_KEY_SEP = '\x1f'
const textLengthCache = new Map<string, number>()
const fontInfoCache = new WeakMap<Element, UnovisFontInfo>()
const classChainFontCache = new Map<string, UnovisFontInfo>()
const measureCtx = globalThis?.document?.createElement('canvas').getContext('2d') ?? null

const getTextCacheKey = (str: string, font: string): string => `${font}${UNOVIS_TEXT_KEY_SEP}${str}`

// Call after a web font loads or styles change — cached widths become stale
export function clearTextMeasurementCache (): void {
  textLengthCache.clear()
  classChainFontCache.clear()
}

// Web fonts often finish loading after the first measurement, which changes
// glyph widths. Clear the cache once the font set settles so stale fallback-font
// widths don't persist.
globalThis?.document?.fonts?.ready?.then(clearTextMeasurementCache)

export function estimateStringPixelLength (str: string, fontSize: number, fontWidthToHeightRatio = getFontWidthToHeightRatio()): number {
  return str.length * fontSize * fontWidthToHeightRatio || 0
}

export function measureTextWidth (str: string, font: string): number {
  if (measureCtx) {
    if (measureCtx.font !== font) measureCtx.font = font
    return measureCtx.measureText(str).width
  }

  // No canvas (e.g. SSR): estimate from the font size parsed out of `font`.
  // The unit is required so we don't accidentally match the numeric font-weight.
  const fontSizeToken = /(\d*\.?\d+)(px|pt|pc|rem|em|ex|ch|cm|mm|in|vmin|vmax|vw|vh|%)/.exec(font)?.[0]
  const fontSize = toPx(fontSizeToken) ?? UNOVIS_TEXT_DEFAULT_FONT_SIZE
  return estimateStringPixelLength(str, fontSize, getFontWidthToHeightRatio())
}

// class + inline style up to the nearest <svg>. Attribute reads don't force
// layout, unlike `getComputedStyle`, so this walk is cheap.
function getClassChainKey (element: Element): string {
  let key = ''
  let el: Element | null = element
  while (el) {
    key += `${UNOVIS_TEXT_KEY_SEP}${el.getAttribute('class') || ''};${el.getAttribute('style') || ''}`

    if (el.localName === 'svg') break
    el = el.parentElement
  }
  return key
}

function getFontInfo (el: Element): UnovisFontInfo {
  let info = fontInfoCache.get(el)
  if (info) return info

  // Keyed by the element's class + inline-style chain up to the nearest <svg>.
  // `getComputedStyle` forces a style recalc, so we resolve the font once per
  // distinct chain and share it.
  const chainKey = getClassChainKey(el)
  info = classChainFontCache.get(chainKey)
  if (info) {
    fontInfoCache.set(el, info)
    return info
  }

  const style = window.getComputedStyle(el)
  const fontSize = style.fontSize || `${UNOVIS_TEXT_DEFAULT_FONT_SIZE}px`
  info = {
    font: `${style.fontStyle || 'normal'} ${style.fontWeight || 'normal'} ${fontSize} ${style.fontFamily || 'sans-serif'}`,
    fontSizePx: toPx(fontSize),
  }

  addToCache(classChainFontCache, chainKey, info)
  fontInfoCache.set(el, info)
  return info
}

export function getCachedFontSizePx (el: Element): number {
  return getFontInfo(el).fontSizePx
}

export function getCachedComputedTextLength (el: SVGTextElement | SVGTSpanElement): number {
  const text = el.textContent || ''
  const { font } = getFontInfo(el)
  const key = getTextCacheKey(text, font)

  const cached = textLengthCache.get(key)
  if (cached !== undefined) return cached

  const length = measureCtx
    ? measureTextWidth(text, font)
    : el.getComputedTextLength()

  addToCache(textLengthCache, key, length)
  return length
}

export function getPreciseStringLengthPx (str: string, fontFamily: string, fontSize: string | number): number {
  const fontSizeStr = typeof fontSize === 'number' ? `${fontSize}px` : fontSize
  const font = `${fontSizeStr} ${fontFamily}`
  const key = getTextCacheKey(str, font)

  const cached = textLengthCache.get(key)
  if (cached !== undefined) return cached

  let length: number

  // If the canvas is not available, but the document is, we use the DOM to measure the text.
  if (!measureCtx && globalThis.document) {
    const svgNS = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(svgNS, 'svg')
    const text = document.createElementNS(svgNS, 'text')
    text.textContent = str
    text.setAttribute('font-size', fontSizeStr)
    text.setAttribute('font-family', fontFamily)
    svg.appendChild(text)
    document.body.appendChild(svg)
    length = text.getComputedTextLength()
    document.body.removeChild(svg)
  } else { // Otherwise, we use the canvas with the fallback estimate.
    length = measureTextWidth(str, font)
  }

  addToCache(textLengthCache, key, length)
  return length
}
