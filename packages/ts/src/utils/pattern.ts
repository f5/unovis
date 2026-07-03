// Types
import { GenericAccessor } from '@/types/accessor'

// Styles
import {
  createColoredMarkerElement,
  getContextMarkerPatternId,
  getFillPatternId,
  getMarkerPatternId,
  getPatternById,
  FillPattern,
  FillPatternType,
  LinePattern,
  LinePatternType,
} from '@/styles/patterns'

// Utils
import { getHexValue } from '@/utils/color'
import { getValue } from '@/utils/data'
import { stringToHtmlId } from '@/utils/misc'

/** Attribute set on chart paths to carry the series index, used by the `theme-patterns` CSS fallback. */
export const UNOVIS_PATTERN_INDEX_ATTR = 'unovis-pattern-index'

const PATTERN_DEFS_CLASS = 'unovis-pattern-defs'

/** Resolves a `pattern` accessor (constant or function) to a built-in pattern definition, or `null`. */
export function getPattern<T> (
  d: T,
  accessor: GenericAccessor<FillPatternType | LinePatternType, T>,
  index?: number
): FillPattern | LinePattern | null {
  const id = getValue<T, FillPatternType | LinePatternType>(d, accessor, index)
  return id ? getPatternById(id) : null
}

/** Returns the CSS `mask` value (`url(#...)`) for a resolved fill pattern, or `null`. */
export function getFillPatternValue (p: FillPattern | LinePattern | null): string | null {
  if (!p || !('svg' in p)) return null
  return `url(#${getFillPatternId(p.id)})`
}

// `context-stroke` lets a shared marker inherit the referencing path's color. Supported everywhere except
// Safari/iOS, where we fall back to injecting a color-specific marker into the chart's own SVG `<defs>`.
let supportsContextStroke: boolean | undefined
function hasContextStrokeSupport (): boolean {
  if (supportsContextStroke === undefined) {
    supportsContextStroke = typeof CSS !== 'undefined' && !!CSS.supports?.('fill', 'context-stroke')
  }
  return supportsContextStroke
}

function getColoredMarkerId (patternId: string, fill: string): string {
  return `${getMarkerPatternId(patternId)}-${stringToHtmlId(fill.replace('#', ''))}`
}

function getOrCreatePatternDefs (svg: SVGSVGElement): SVGDefsElement {
  let defs = svg.querySelector(`defs.${PATTERN_DEFS_CLASS}`)
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    defs.setAttribute('class', PATTERN_DEFS_CLASS)
    svg.insertBefore(defs, svg.firstChild)
  }
  return defs as SVGDefsElement
}

/**
 * Returns the marker `url(#...)` and dash array for a resolved line pattern.
 * Uses a shared `context-stroke` marker that inherits the path color when supported, otherwise
 * injects a color-specific marker into the chart SVG (`color` and `context` are only needed for the fallback).
 */
export function getLinePatternValue (
  p: FillPattern | LinePattern | null,
  color?: string | null,
  context?: Element | null
): { marker: string | null; dashArray: string | null } | null {
  if (!p || !('marker' in p)) return null

  const dashArray = p.dashArray?.length ? p.dashArray.join(' ') : null

  if (hasContextStrokeSupport()) {
    return { marker: `url(#${getContextMarkerPatternId(p.id)})`, dashArray }
  }

  const svgRoot = (context instanceof SVGElement ? context.ownerSVGElement : null) ??
    context?.closest('svg')

  if (!svgRoot || !color) return { marker: null, dashArray }

  const fill = getHexValue(color, svgRoot) || color
  const markerId = getColoredMarkerId(p.id, fill)
  const defs = getOrCreatePatternDefs(svgRoot)

  if (!defs.querySelector(`#${CSS.escape(markerId)}`)) {
    defs.appendChild(createColoredMarkerElement(p, markerId, fill))
  }

  return { marker: `url(#${markerId})`, dashArray }
}
