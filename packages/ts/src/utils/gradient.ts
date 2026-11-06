// Types
import { GenericAccessor } from '@/types/accessor'
import { Gradient, GradientDirection, GradientSpace, GradientStop, GradientType, GradientUnits } from '@/types/gradient'

// Styles
import { GRADIENT_DEFAULT_STOPS, GRADIENT_DEFS_CLASS, GRADIENT_ID_ALPHABET, GRADIENT_ID_PREFIX } from '@/styles/gradients'

// Utils
import { getValue } from '@/utils/data'

export type GradientFillOptions = {
  /** Component default for `Gradient.type` */
  type?: GradientType;
  /** Component default for `Gradient.direction` */
  direction?: GradientDirection;
  /** Component default for `Gradient.units` */
  units?: GradientUnits;
  /** Component default for `Gradient.stops` */
  stops?: GradientStop[];
  /** Area covered by a `GradientUnits.UserSpaceOnUse` gradient. Without it, the gradient falls back to the bounding box units */
  space?: GradientSpace;
}

const LINEAR_VECTORS: Record<GradientDirection, [number, number, number, number]> = {
  [GradientDirection.TopToBottom]: [0, 0, 0, 1],
  [GradientDirection.BottomToTop]: [0, 1, 0, 0],
  [GradientDirection.LeftToRight]: [0, 0, 1, 0],
  [GradientDirection.RightToLeft]: [1, 0, 0, 0],
}

const scopeNonces = new WeakMap<SVGElement, string>()

function toLetters (n: number): string {
  let letters = ''
  for (let i = 28; i >= 0; i -= 4) letters += GRADIENT_ID_ALPHABET[(n >>> i) & 0xf]
  return letters
}

// FNV-1a 32-bit
function hashString (s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// `url(#id)` resolves to the first matching id in the document, so each scope needs its own namespace
// to keep gradients with the same recipe from inheriting another component's colors
function getScopeNonce (scope: SVGElement): string {
  let nonce = scopeNonces.get(scope)
  if (!nonce) {
    nonce = toLetters(crypto.getRandomValues(new Uint32Array(1))[0])
    scopeNonces.set(scope, nonce)
  }
  return nonce
}

function normalizeColorKey (color: string): string {
  const c = color.trim()
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c)
  if (!m) return c
  const s = m[1].toLowerCase()
  return s.length === 3 ? `#${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}` : `#${s}`
}

function getStopColor (stop: GradientStop, color: string | null): string {
  const c = stop.color ?? color
  if (!stop.colorShift) return c
  const pct = Math.round(Math.min(1, Math.abs(stop.colorShift)) * 100)
  return `color-mix(in srgb, ${c} ${100 - pct}%, ${stop.colorShift > 0 ? 'white' : 'black'})`
}

function getGradientDefs (scope: SVGElement): SVGDefsElement {
  let defs = scope.querySelector<SVGDefsElement>(`:scope > defs.${GRADIENT_DEFS_CLASS}`)
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    defs.setAttribute('class', GRADIENT_DEFS_CLASS)
    scope.insertBefore(defs, scope.firstChild)
  }
  return defs
}

function createGradientElement (
  id: string,
  type: GradientType,
  direction: GradientDirection,
  stops: GradientStop[],
  color: string | null,
  space: GradientSpace | undefined
): SVGGradientElement {
  const isRadial = type === GradientType.Radial
  const el = document.createElementNS('http://www.w3.org/2000/svg', isRadial ? 'radialGradient' : 'linearGradient')
  el.setAttribute('id', id)
  el.setAttribute('gradientUnits', space ? GradientUnits.UserSpaceOnUse : GradientUnits.ObjectBoundingBox)

  let innerOffset = 0
  if (isRadial) {
    const r = space ? Math.max(space.width, space.height) / 2 : 0.5
    el.setAttribute('cx', `${space ? space.x + space.width / 2 : 0.5}`)
    el.setAttribute('cy', `${space ? space.y + space.height / 2 : 0.5}`)
    el.setAttribute('r', `${r}`)
    if (space?.innerRadius && r) innerOffset = Math.min(1, space.innerRadius / r)
  } else {
    const [x1, y1, x2, y2] = LINEAR_VECTORS[direction] ?? LINEAR_VECTORS[GradientDirection.TopToBottom]
    el.setAttribute('x1', `${space ? space.x + x1 * space.width : x1}`)
    el.setAttribute('y1', `${space ? space.y + y1 * space.height : y1}`)
    el.setAttribute('x2', `${space ? space.x + x2 * space.width : x2}`)
    el.setAttribute('y2', `${space ? space.y + y2 * space.height : y2}`)
  }

  for (const stop of stops) {
    const stopEl = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stopEl.setAttribute('offset', `${innerOffset + stop.offset * (1 - innerOffset)}`)
    // Using inline styles rather than presentation attributes so CSS variables and `color-mix()` resolve everywhere
    stopEl.style.setProperty('stop-color', getStopColor(stop, color))
    stopEl.style.setProperty('stop-opacity', `${stop.opacity ?? 1}`)
    el.appendChild(stopEl)
  }

  return el
}

/** Resolves a `gradient` accessor to a gradient definition. `true` stands for the component's default gradient */
export function getGradient<T> (
  d: T,
  accessor: GenericAccessor<Gradient | boolean, T>,
  index?: number
): Gradient | null {
  const value = getValue<T, Gradient | boolean>(d, accessor, index)
  if (!value) return null
  return value === true ? {} : value
}

/**
 * Returns the `fill` value for an element painted with `color` and an optional `gradient`.
 * When a gradient is set, injects the matching `<linearGradient>` / `<radialGradient>` into the `<defs>` of
 * the context element's SVG group and returns its `url(#...)`; otherwise returns `color` as is.
 * Keep using `color` for everything that's derived from it (outlines, legends, tooltips, label contrast).
 */
export function getGradientFillValue (
  gradient: Gradient | null | undefined,
  color: string | null | undefined,
  context: Element | null | undefined,
  options: GradientFillOptions = {}
): string | null {
  if (!gradient) return color ?? null

  const svg = context?.closest('svg')
  const stops = gradient.stops ?? options.stops ?? GRADIENT_DEFAULT_STOPS
  const baseColor = color ?? null
  if (!svg || !stops.length || (!baseColor && stops.some(s => !s.color))) return color ?? null

  const type = gradient.type ?? options.type ?? GradientType.Linear
  const direction = gradient.direction ?? options.direction ?? GradientDirection.TopToBottom
  const units = gradient.units ?? options.units ?? GradientUnits.ObjectBoundingBox
  const space = units === GradientUnits.UserSpaceOnUse ? options.space : undefined

  const round = (v: number): number => Math.round(v * 100) / 100
  const recipe = [
    type,
    type === GradientType.Linear ? direction : '',
    space ? [space.x, space.y, space.width, space.height, space.innerRadius ?? 0].map(round).join(',') : '',
    stops.map(s => `${s.offset}:${s.opacity ?? 1}:${s.colorShift ?? 0}:${s.color ? normalizeColorKey(s.color) : ''}`).join(';'),
    baseColor ? normalizeColorKey(baseColor) : '',
  ].join('|')
  const scope = context.closest<SVGElement>('g, svg')
  const id = `${GRADIENT_ID_PREFIX}-${getScopeNonce(scope)}-${toLetters(hashString(recipe))}`

  const defs = getGradientDefs(scope)
  if (!defs.querySelector(`[id="${id}"]`)) {
    defs.appendChild(createGradientElement(id, type, direction, stops, baseColor, space))
  }

  return `url(#${id})`
}
