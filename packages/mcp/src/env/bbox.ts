/** SVG geometry polyfills for jsdom.
 *
 * jsdom implements no SVG layout: `getBBox`, `getBoundingClientRect` (for SVG
 * content) and `getComputedTextLength` are missing or return zeros. Unovis
 * relies on them for axis auto-margins, label trimming/placement and overlap
 * detection. This module implements them with attribute math + real canvas
 * text metrics.
 *
 * Note: jsdom instantiates most SVG tags as plain `SVGElement`, so the
 * polyfills are installed on `SVGElement.prototype` with tag-based dispatch.
 */
import pathBounds from 'svg-path-bounds'

import type { DOMWindow } from 'jsdom'

import { measureTextWidth } from './canvas.js'
import { resolveFontShorthand } from './computed-style.js'

export interface Box { x: number; y: number; width: number; height: number }

const EMPTY_BOX: Box = { x: 0, y: 0, width: 0, height: 0 }
const NON_RENDERED_TAGS = new Set(['defs', 'clippath', 'mask', 'marker', 'pattern', 'symbol', 'title', 'desc', 'style', 'script', 'filter'])
const LINE_HEIGHT = 1.2
const ASCENT_RATIO = 0.8

const num = (el: Element, attr: string, fallback = 0): number => {
  const value = parseFloat(el.getAttribute(attr) ?? '')
  return Number.isFinite(value) ? value : fallback
}

/** Parse em/px length attributes like dy="1.25em" relative to a font size */
const lengthToPx = (value: string | null, fontSizePx: number): number => {
  if (!value) return 0
  const parsed = parseFloat(value)
  if (!Number.isFinite(parsed)) return 0
  return value.trim().endsWith('em') ? parsed * fontSizePx : parsed
}

/** Resolve an inherited presentation attribute (attribute or inline style)
 * through the ancestor chain — e.g. d3-axis sets text-anchor on the axis
 * <g>, not on the tick <text> elements. */
const inheritedAttr = (el: Element, name: string): string | null => {
  let node: Element | null = el
  while (node && node.namespaceURI?.endsWith('svg')) {
    const attr = node.getAttribute(name)
    if (attr) return attr
    const inline = (node as SVGElement).style?.getPropertyValue(name)
    if (inline) return inline
    node = node.parentElement
  }
  return null
}

// ── transforms ──────────────────────────────────────────────────────────────

/** 2D affine matrix [a b c d e f] — same layout as SVG matrix() */
type Matrix = [number, number, number, number, number, number]
const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0]

const multiply = (m1: Matrix, m2: Matrix): Matrix => ([
  m1[0] * m2[0] + m1[2] * m2[1],
  m1[1] * m2[0] + m1[3] * m2[1],
  m1[0] * m2[2] + m1[2] * m2[3],
  m1[1] * m2[2] + m1[3] * m2[3],
  m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
  m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
])

export function parseTransform (transform: string | null): Matrix {
  if (!transform) return IDENTITY
  let matrix = IDENTITY
  const fnRegex = /(translate|scale|rotate|matrix)\s*\(([^)]*)\)/g
  for (const match of transform.matchAll(fnRegex)) {
    const args = match[2].split(/[\s,]+/).filter(s => s.length).map(Number)
    switch (match[1]) {
      case 'translate':
        matrix = multiply(matrix, [1, 0, 0, 1, args[0] || 0, args[1] || 0])
        break
      case 'scale':
        matrix = multiply(matrix, [args[0] ?? 1, 0, 0, args[1] ?? args[0] ?? 1, 0, 0])
        break
      case 'rotate': {
        const angle = (args[0] || 0) * Math.PI / 180
        const [cx, cy] = [args[1] || 0, args[2] || 0]
        const [cos, sin] = [Math.cos(angle), Math.sin(angle)]
        matrix = multiply(matrix, [1, 0, 0, 1, cx, cy])
        matrix = multiply(matrix, [cos, sin, -sin, cos, 0, 0])
        matrix = multiply(matrix, [1, 0, 0, 1, -cx, -cy])
        break
      }
      case 'matrix':
        if (args.length === 6) matrix = multiply(matrix, args as Matrix)
        break
    }
  }
  return matrix
}

const transformBox = (box: Box, matrix: Matrix): Box => {
  if (matrix === IDENTITY) return box
  const corners = [
    [box.x, box.y],
    [box.x + box.width, box.y],
    [box.x, box.y + box.height],
    [box.x + box.width, box.y + box.height],
  ]
  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity]
  for (const [x, y] of corners) {
    const tx = matrix[0] * x + matrix[2] * y + matrix[4]
    const ty = matrix[1] * x + matrix[3] * y + matrix[5]
    minX = Math.min(minX, tx); minY = Math.min(minY, ty)
    maxX = Math.max(maxX, tx); maxY = Math.max(maxY, ty)
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

// ── per-shape boxes ─────────────────────────────────────────────────────────

interface TextLine {
  text: string;
  x: number;
  /** Baseline advance relative to the previous line (from dy) */
  dyPx: number;
  baseline: string;
}

/** Flatten a <text> element into positioned lines. Unovis's
 * renderTextToTspanElements produces <text><tspan y? font-size?><tspan x dy
 * dominant-baseline>line</tspan>…</tspan></text> — the y offset lives on the
 * first block tspan and lines advance via em-based dy on the inner tspans. */
function collectTextLines (el: Element, fontSizePx: number): { lines: TextLine[]; startY: number } {
  const ownX = num(el, 'x')
  const defaultBaseline = inheritedAttr(el, 'dominant-baseline') ?? 'auto'
  const blocks = Array.from(el.children).filter(c => c.localName === 'tspan')

  if (!blocks.length) {
    return {
      lines: [{ text: el.textContent ?? '', x: ownX, dyPx: lengthToPx(el.getAttribute('dy'), fontSizePx), baseline: defaultBaseline }],
      startY: num(el, 'y'),
    }
  }

  let startY = parseFloat(el.getAttribute('y') ?? '')
  const lines: TextLine[] = []
  for (const block of blocks) {
    if (!Number.isFinite(startY)) {
      const blockY = parseFloat(block.getAttribute('y') ?? '')
      if (Number.isFinite(blockY)) startY = blockY
    }
    const blockFontSize = parseFloat(block.getAttribute('font-size') ?? '') || fontSizePx
    const lineTspans = Array.from(block.children).filter(c => c.localName === 'tspan')
    const items = lineTspans.length ? lineTspans : [block]
    for (const item of items) {
      lines.push({
        text: item.textContent ?? '',
        x: num(item, 'x', num(block, 'x', ownX)),
        dyPx: lengthToPx(item.getAttribute('dy'), blockFontSize),
        baseline: item.getAttribute('dominant-baseline') ?? defaultBaseline,
      })
    }
  }
  return { lines, startY: Number.isFinite(startY) ? startY : 0 }
}

function textBox (el: Element, document: Document): Box {
  const { font, fontSizePx } = resolveFontShorthand(el, document)
  const anchor = inheritedAttr(el, 'text-anchor')
  const { lines, startY } = collectTextLines(el, fontSizePx)

  let minLeft = Infinity
  let maxRight = -Infinity
  let top = Infinity
  let bottom = -Infinity
  let baselineY = startY

  for (const line of lines) {
    baselineY += line.dyPx
    const lineWidth = measureTextWidth(line.text, font)
    let left = line.x
    if (anchor === 'middle') left -= lineWidth / 2
    else if (anchor === 'end') left -= lineWidth
    minLeft = Math.min(minLeft, left)
    maxRight = Math.max(maxRight, left + lineWidth)

    // Map the baseline position to the line's top edge
    let lineTop: number
    if (line.baseline === 'central' || line.baseline === 'middle') lineTop = baselineY - fontSizePx * 0.6
    else if (line.baseline === 'hanging' || line.baseline === 'text-before-edge') lineTop = baselineY
    else lineTop = baselineY - fontSizePx * ASCENT_RATIO
    top = Math.min(top, lineTop)
    bottom = Math.max(bottom, lineTop + fontSizePx * LINE_HEIGHT)
  }

  if (!Number.isFinite(minLeft)) return EMPTY_BOX
  return { x: minLeft, y: top, width: maxRight - minLeft, height: bottom - top }
}

function pointsBox (el: Element): Box {
  const values = (el.getAttribute('points') ?? '').split(/[\s,]+/).filter(s => s.length).map(Number)
  if (values.length < 2) return EMPTY_BOX
  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity]
  for (let i = 0; i + 1 < values.length; i += 2) {
    minX = Math.min(minX, values[i]); maxX = Math.max(maxX, values[i])
    minY = Math.min(minY, values[i + 1]); maxY = Math.max(maxY, values[i + 1])
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

function pathBox (el: Element): Box {
  const d = el.getAttribute('d')
  if (!d) return EMPTY_BOX
  try {
    const [left, top, right, bottom] = pathBounds(d)
    if (![left, top, right, bottom].every(Number.isFinite)) return EMPTY_BOX
    return { x: left, y: top, width: right - left, height: bottom - top }
  } catch {
    return EMPTY_BOX
  }
}

function unionBox (el: Element, document: Document): Box {
  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity]
  for (const child of Array.from(el.children)) {
    if (NON_RENDERED_TAGS.has(child.localName)) continue
    if (child.getAttribute('display') === 'none') continue
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const box = computeBox(child, document)
    if (box.width === 0 && box.height === 0) continue
    const transformed = transformBox(box, parseTransform(child.getAttribute('transform')))
    minX = Math.min(minX, transformed.x); minY = Math.min(minY, transformed.y)
    maxX = Math.max(maxX, transformed.x + transformed.width)
    maxY = Math.max(maxY, transformed.y + transformed.height)
  }
  if (!Number.isFinite(minX)) return EMPTY_BOX
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

export function computeBox (el: Element, document: Document): Box {
  switch (el.localName) {
    case 'text':
    case 'tspan':
      return textBox(el, document)
    case 'rect':
    case 'image':
    case 'foreignobject':
      return { x: num(el, 'x'), y: num(el, 'y'), width: num(el, 'width'), height: num(el, 'height') }
    case 'line': {
      const [x1, y1, x2, y2] = [num(el, 'x1'), num(el, 'y1'), num(el, 'x2'), num(el, 'y2')]
      return { x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) }
    }
    case 'circle': {
      const r = num(el, 'r')
      return { x: num(el, 'cx') - r, y: num(el, 'cy') - r, width: 2 * r, height: 2 * r }
    }
    case 'ellipse': {
      const [rx, ry] = [num(el, 'rx'), num(el, 'ry')]
      return { x: num(el, 'cx') - rx, y: num(el, 'cy') - ry, width: 2 * rx, height: 2 * ry }
    }
    case 'polyline':
    case 'polygon':
      return pointsBox(el)
    case 'path':
      return pathBox(el)
    default:
      return unionBox(el, document)
  }
}

// ── installation ────────────────────────────────────────────────────────────

export function installBBoxPolyfills (window: DOMWindow): void {
  const document = window.document
  const proto = window.SVGElement.prototype as SVGElement & {
    getBBox?: () => Box;
    getComputedTextLength?: () => number;
  }

  proto.getBBox = function (this: SVGElement): Box {
    return computeBox(this, document)
  }

  proto.getComputedTextLength = function (this: SVGElement): number {
    const { font } = resolveFontShorthand(this, document)
    return measureTextWidth(this.textContent ?? '', font)
  }

  // Overlap detection (utils/text-overlap.ts) and a few components measure
  // labels via getBoundingClientRect — reconstruct it from local geometry
  // mapped through ancestor transforms (the chart sits at the page origin).
  Object.defineProperty(window.SVGElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: function (this: SVGElement) {
      let box = computeBox(this, document)
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let node: Element | null = this
      while (node && node.localName !== 'svg') {
        box = transformBox(box, parseTransform(node.getAttribute('transform')))
        node = node.parentElement
      }
      return {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        top: box.y,
        left: box.x,
        right: box.x + box.width,
        bottom: box.y + box.height,
        toJSON: () => box,
      }
    },
  })
}
