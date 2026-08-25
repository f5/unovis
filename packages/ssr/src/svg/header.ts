/** Title and legend synthesis.
 *
 * Unovis containers have no title concept, and its legends (BulletLegend) are
 * HTML components rendered outside the SVG — neither can appear in standalone
 * SVG output. Both are synthesized here: the chart content is wrapped in a
 * translated group and a header block (title + swatch legend) is drawn above.
 */
import { measureTextWidth } from '../env/canvas.js'
import { substituteVarsForElement } from './css-vars.js'
import type { VarContext } from './css-vars.js'
/** One legend entry drawn in the synthesized header. `color` wins; without
 * it, `paletteIndex` resolves against the theme palette during
 * post-processing. */
export interface LegendItemSpec {
  name: string;
  /** Resolved during post-processing when omitted (default palette) */
  color?: string;
  /** Palette index used when color is not set */
  paletteIndex?: number;
}

const SVG_NS = 'http://www.w3.org/2000/svg'

const TITLE_FONT_SIZE = 16
const TITLE_ROW_HEIGHT = 28
const LEGEND_FONT_SIZE = 12
const LEGEND_ROW_HEIGHT = 22
const LEGEND_SWATCH = 10
const LEGEND_GAP = 16
const PADDING_X = 16
const PADDING_TOP = 12
const PADDING_BOTTOM = 4

export interface HeaderSpec {
  title?: string;
  legend?: LegendItemSpec[];
  fontFamily: string;
}

interface LegendLayoutItem {
  name: string;
  color: string;
  x: number;
  row: number;
  labelWidth: number;
}

export function renderHeader (svg: SVGSVGElement, document: Document, header: HeaderSpec, ctx: VarContext, width: number): number {
  if (!header.title && !header.legend?.length) return 0

  const dark = ctx.theme === 'dark'
  const titleColor = dark ? '#f2f4f9' : '#1f2937'
  const labelColor = dark ? '#c8ced9' : '#4b5563'
  const font = (size: number): string => `${size}px ${header.fontFamily}`

  // Lay out legend items with wrapping
  const items: LegendLayoutItem[] = []
  let legendRows = 0
  if (header.legend?.length) {
    let x = PADDING_X
    let row = 0
    for (const item of header.legend) {
      const color = item.color ?? substituteVarsForElement(`var(--vis-color${(item.paletteIndex ?? 0) % 6})`, null, ctx)
      const labelWidth = measureTextWidth(item.name, font(LEGEND_FONT_SIZE))
      const itemWidth = LEGEND_SWATCH + 6 + labelWidth
      if (x + itemWidth > width - PADDING_X && x > PADDING_X) {
        row += 1
        x = PADDING_X
      }
      items.push({ name: item.name, color, x, row, labelWidth })
      x += itemWidth + LEGEND_GAP
    }
    legendRows = row + 1
  }

  const headerHeight = PADDING_TOP + (header.title ? TITLE_ROW_HEIGHT : 0) + legendRows * LEGEND_ROW_HEIGHT + PADDING_BOTTOM

  // The caller wraps the chart content and offsets it below the header
  const headerGroup = document.createElementNS(SVG_NS, 'g')
  svg.insertBefore(headerGroup, svg.firstChild)

  if (header.title) {
    const titleEl = document.createElementNS(SVG_NS, 'text')
    titleEl.setAttribute('x', String(PADDING_X))
    titleEl.setAttribute('y', String(PADDING_TOP + TITLE_FONT_SIZE))
    titleEl.setAttribute('font-size', String(TITLE_FONT_SIZE))
    titleEl.setAttribute('font-weight', '600')
    titleEl.setAttribute('fill', titleColor)
    titleEl.textContent = header.title
    headerGroup.appendChild(titleEl)
  }

  const legendOffsetY = PADDING_TOP + (header.title ? TITLE_ROW_HEIGHT : 0)
  for (const item of items) {
    const y = legendOffsetY + item.row * LEGEND_ROW_HEIGHT + (LEGEND_ROW_HEIGHT - LEGEND_SWATCH) / 2
    const swatch = document.createElementNS(SVG_NS, 'rect')
    swatch.setAttribute('x', String(item.x))
    swatch.setAttribute('y', String(y))
    swatch.setAttribute('width', String(LEGEND_SWATCH))
    swatch.setAttribute('height', String(LEGEND_SWATCH))
    swatch.setAttribute('rx', '2')
    swatch.setAttribute('fill', item.color)
    headerGroup.appendChild(swatch)

    const label = document.createElementNS(SVG_NS, 'text')
    label.setAttribute('x', String(item.x + LEGEND_SWATCH + 6))
    label.setAttribute('y', String(y + LEGEND_SWATCH - 1))
    label.setAttribute('font-size', String(LEGEND_FONT_SIZE))
    label.setAttribute('fill', labelColor)
    label.textContent = item.name
    headerGroup.appendChild(label)
  }

  return headerHeight
}
