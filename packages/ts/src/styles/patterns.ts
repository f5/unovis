import { getCSSColorVariable } from './colors'

export type PatternDef = {
  id: string;
  width?: number;
  height?: number;
}

export type FillPattern = PatternDef & {
  svg: string;
}

export type LinePattern = PatternDef & {
  marker: string;
  dashArray: number[];
}

/** Ids of the built-in fill patterns, usable with a component's `pattern` accessor. */
export enum FillPatternType {
  StripesDiagonal = 'stripes-diagonal',
  Dots = 'dots',
  StripesVertical = 'stripes-vertical',
  Crosshatch = 'crosshatch',
  Waves = 'waves',
  Circles = 'circles',
}

/** Ids of the built-in line patterns, usable with a component's `pattern` accessor. */
export enum LinePatternType {
  Circle = 'circle',
  Triangle = 'triangle',
  Diamond = 'diamond',
  Arrow = 'arrow',
  Square = 'square',
  Star = 'star',
}

export const PATTERN_SIZE_PX = 10

export const fills: FillPattern[] = [
  { id: FillPatternType.StripesDiagonal, svg: '<path d="M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2" stroke="#000"/>' },
  { id: FillPatternType.Dots, svg: '<path d="m0-1.5a1 1 0 010 3m10-3a1 1 0 000 3M5 3.5a1 1 0 010 3 1 1 0 010-3M0 8.5 a1 1 0 010 3m10-3a1 1 0 000 3" fill"#000"/>' },
  { id: FillPatternType.StripesVertical, svg: '<path d="M 5,-1 L5,11" stroke="#000"/>' },
  { id: FillPatternType.Crosshatch, svg: '<path d="M0 0L10 10ZM10 0L0 10Z" stroke="#000"/>' },
  { id: FillPatternType.Waves, svg: '<path d="M0 4Q2.5 1 5 4 7.5 7 10 4v2Q7.5 9 5 6 2.5 3 0 6Z" fill="#000"/>' },
  { id: FillPatternType.Circles, svg: '<circle cx="5" cy="5" r="3" stroke="#000" fill="#fff"/>' },
]
export const lines: LinePattern[] = [
  { id: LinePatternType.Circle, marker: '<circle cx="5" cy="5" r="5"/>', dashArray: [] },
  { id: LinePatternType.Triangle, marker: '<path d="M5,0 L10,9 L0,9Z">', dashArray: [9, 1] },
  { id: LinePatternType.Diamond, marker: '<path d="M 0 5 L5 0 L 10 5 L 5 10 L 0 5Z">', dashArray: [2] },
  { id: LinePatternType.Arrow, marker: '<path d="M4 0 0 0 6 5 0 10 4 10 10 5Z">', dashArray: [2, 3, 8, 3] },
  { id: LinePatternType.Square, marker: '<rect x="1" y="1" width="8" height="8"/>', dashArray: [6] },
  { id: LinePatternType.Star, marker: '<path d="m2 9 3-9 3 9L0 3h10Z"/>', dashArray: [1, 6] },
]

const fillById = new Map<string, FillPattern>(fills.map(f => [f.id, f]))
const lineById = new Map<string, LinePattern>(lines.map(l => [l.id, l]))

export function getPatternVariable (p: PatternDef): string {
  return `vis-${`pattern-${(p as FillPattern).svg ? 'fill' : 'marker'}`}-${p.id}`
}

/** DOM id used to reference a fill pattern's `<mask>` (e.g. `url(#vis-pattern-fill-<id>)`). */
export function getFillPatternId (id: string): string {
  return `vis-pattern-fill-${id}`
}

/** DOM id used to reference a line pattern's `<marker>` (e.g. `url(#vis-pattern-marker-<id>)`). */
export function getMarkerPatternId (id: string): string {
  return `vis-pattern-marker-${id}`
}

/** DOM id of the `context-stroke` marker variant, which inherits the referencing path's color. */
export function getContextMarkerPatternId (id: string): string {
  return `vis-pattern-marker-ctx-${id}`
}

/** Looks up a built-in pattern by id, returning its `FillPattern` or `LinePattern` definition, or `null`. */
export function getPatternById (id: string): FillPattern | LinePattern | null {
  return fillById.get(id) ?? lineById.get(id) ?? null
}

// No percentage units here: Chromium resolves them against the 0×0 defs container (not the
// referencing chart's viewport), which would collapse the mask to zero coverage (#843).
const maskDef = (p: FillPattern): string =>
  `<mask id="${getFillPatternId(p.id)}">
    <pattern id="vis-pattern-tile-${p.id}" viewBox="0 0 10 10" width="${PATTERN_SIZE_PX}" height="${PATTERN_SIZE_PX}" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="#fff"/>
      ${p.svg}
    </pattern>
    <rect x="-100000" y="-100000" width="200000" height="200000" fill="url(#vis-pattern-tile-${p.id})"/>
  </mask>`

// Index-colored marker used by the `theme-patterns` CSS fallback, where the series index maps to a fixed color.
const markerDef = (p: LinePattern, i: number): string =>
  `<marker id="${getMarkerPatternId(p.id)}"
    fill="var(${getCSSColorVariable(i)})"
    markerUnits="userSpaceOnUse"
    refX="5"
    refY="5"
    markerWidth="${PATTERN_SIZE_PX}"
    markerHeight="${PATTERN_SIZE_PX}">
    ${p.marker}
  </marker>`

// `context-stroke` marker that inherits the referencing path's color (modern browsers; see `utils/pattern.ts`).
const contextMarkerDef = (p: LinePattern): string =>
  `<marker id="${getContextMarkerPatternId(p.id)}"
    fill="context-stroke"
    markerUnits="userSpaceOnUse"
    refX="5"
    refY="5"
    markerWidth="${PATTERN_SIZE_PX}"
    markerHeight="${PATTERN_SIZE_PX}">
    ${p.marker}
  </marker>`

/** Creates a `<marker>` element with an explicit fill color (fallback for browsers without `context-stroke`). */
export function createColoredMarkerElement (p: LinePattern, id: string, fill: string): SVGMarkerElement {
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
  marker.setAttribute('id', id)
  marker.setAttribute('fill', fill)
  marker.setAttribute('markerUnits', 'userSpaceOnUse')
  marker.setAttribute('refX', '5')
  marker.setAttribute('refY', '5')
  marker.setAttribute('markerWidth', String(PATTERN_SIZE_PX))
  marker.setAttribute('markerHeight', String(PATTERN_SIZE_PX))
  marker.innerHTML = p.marker
  return marker
}

// Injecting SVG defs as a single SVG element on the page
function injectSVGDefs (): void {
  const markerDefs = lines.map((p, i) => markerDef(p, i)).concat(lines.map(contextMarkerDef))
  const svgDefs = fills.map(maskDef).concat(markerDefs).join('')
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  // Zero-sized so the insertion doesn't register as a viewport-sized layout shift (CLS ~1.0, #843).
  // Referenced defs (masks/markers) still work at 0×0 — but not under `display: none`.
  svg.setAttribute('height', '0')
  svg.setAttribute('width', '0')
  svg.style.position = 'fixed'
  svg.style.zIndex = '-99999999'
  svg.innerHTML = `<defs>${svgDefs}</defs>`
  document.body.appendChild(svg)
}

if (typeof window !== 'undefined') injectSVGDefs()
