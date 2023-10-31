import { getCSSColorVariable } from './colors'

type Pattern = {
  id: string;
  width?: number;
  height?: number;
}

type FillPattern = Pattern & {
  svg: string;
}

type LinePattern = Pattern & {
  marker: string;
  dashArray: number[];
}

export const PATTERN_SIZE_PX = 10

export const fills: FillPattern[] = [
  { id: 'stripes-diagonal', svg: '<path d="M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2" stroke="#000"/>' },
  { id: 'dots', svg: '<path d="m0-1.5a1 1 0 010 3m10-3a1 1 0 000 3M5 3.5a1 1 0 010 3 1 1 0 010-3M0 8.5 a1 1 0 010 3m10-3a1 1 0 000 3" fill"#000"/>' },
  { id: 'stripes-vertical', svg: '<path d="M 5,-1 L5,11" stroke="#000"/>' },
  { id: 'crosshatch', svg: '<path d="M0 0L10 10ZM10 0L0 10Z" stroke="#000"/>' },
  { id: 'waves', svg: '<path d="M0 4Q2.5 1 5 4 7.5 7 10 4v2Q7.5 9 5 6 2.5 3 0 6Z" fill="#000"/>' },
  { id: 'circles', svg: '<circle cx="5" cy="5" r="3" stroke="#000" fill="#fff"/>' },
]
export const lines: LinePattern[] = [
  { id: 'circle', marker: '<circle cx="5" cy="5" r="5"/>', dashArray: [] },
  { id: 'triangle', marker: '<path d="M5,0 L10,9 L0,9Z">', dashArray: [9, 1] },
  { id: 'diamond', marker: '<path d="M 0 5 L5 0 L 10 5 L 5 10 L 0 5Z">', dashArray: [2] },
  { id: 'arrow', marker: '<path d="M4 0 0 0 6 5 0 10 4 10 10 5Z">', dashArray: [2, 3, 8, 3] },
  { id: 'square', marker: '<rect x="1" y="1" width="8" height="8"/>', dashArray: [6] },
  { id: 'star', marker: '<path d="m2 9 3-9 3 9L0 3h10Z"/>', dashArray: [1, 6] },
]

export function getPatternVariable (p: Pattern): string {
  return `vis-${`pattern-${(p as FillPattern).svg ? 'fill' : 'marker'}`}-${p.id}`
}

const maskDef = (p: FillPattern): string =>
  `<mask id="${getPatternVariable(p)}">
    <pattern id="${p.id}" viewBox="0 0 10 10" width="${PATTERN_SIZE_PX}" height="${PATTERN_SIZE_PX}" patternUnits="userSpaceOnUse">
      <rect width="100%" height="100%" fill="#fff"/>
      ${p.svg}
    </pattern>
    <rect x="-50%" y="-50%" width="200%" height="200%" fill="url(#${p.id})"/>
  </mask>`

const markerDef = (p: LinePattern, i: number): string =>
  `<marker id="${getPatternVariable(p)}"
    fill="var(${getCSSColorVariable(i)})"
    markerUnits="userSpaceOnUse"
    refX="5"
    refY="5"
    markerWidth="${PATTERN_SIZE_PX}"
    markerHeight="${PATTERN_SIZE_PX}">
    ${p.marker}
  </marker>`

// // Injecting SVG defs as a single SVG element on the page
function injectSVGDefs (): void {
  const svgDefs = fills.map(maskDef).concat(lines.map(markerDef)).join('')
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('height', '100%')
  svg.setAttribute('width', '100%')
  svg.style.position = 'fixed'
  svg.style.zIndex = '-99999999'
  svg.innerHTML = `<defs>${svgDefs}</defs>`
  document.body.appendChild(svg)
}

if (typeof window !== 'undefined') injectSVGDefs()
