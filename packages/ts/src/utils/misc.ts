import { StringAccessor } from 'types/accessor'
import { LengthUnit, Rect } from 'types/misc'
import { getString, isString } from 'utils/data'
import toPx from 'to-px'

export function guid (): string {
  const s4 = (): string =>
    Math.floor((1 + crypto.getRandomValues(new Uint32Array(1))[0]) * 0x10000)
      .toString(16)
      .substring(1)

  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`
}

export function stringToHtmlId (str: string): string {
  return (str || '').replace(/\W/g, '_')
}

export function isStringCSSVariable (s: string): boolean {
  return isString(s) ? (s.substring(0, 6) === 'var(--') : false
}

export function getCSSVariableValue (s: string, context: HTMLElement | SVGElement): string {
  if (!isString(s)) return ''
  const variableName = s.substr(4, s.length - 5)
  return getComputedStyle(context).getPropertyValue(variableName)
}

export function getCSSVariableValueInPixels (s: string, context: HTMLElement | SVGElement): number {
  const val = getCSSVariableValue(s, context)
  return toPx(val)
}

export function getPixelValue (v: string | number): number | null {
  return typeof v === 'number' ? v : toPx(v)
}

export function rectIntersect (rect1: Rect, rect2: Rect, tolerancePx = 0): boolean {
  const [left1, top1, right1, bottom1] = [
    rect1.x + tolerancePx,
    rect1.y + rect1.height - 2 * tolerancePx,
    rect1.x + rect1.width - 2 * tolerancePx,
    rect1.y + tolerancePx,
  ]
  const [left2, top2, right2, bottom2] = [
    rect2.x + tolerancePx,
    rect2.y + rect2.height - 2 * tolerancePx,
    rect2.x + rect2.width - 2 * tolerancePx,
    rect2.y + tolerancePx,
  ]

  return !(top1 < bottom2 || top2 < bottom1 || right1 < left2 || right2 < left1)
}

export function getHref<T> (d: T, identifier: StringAccessor<T>): string {
  const id = getString(d, identifier)
  return id ? `url(#${id})` : null
}

export function parseUnit (value: LengthUnit, basis = 0): number {
  if (!value) return 0
  else if (typeof value === 'number') return value
  else if (value.endsWith('%')) return basis * parseFloat(value) / 100
  else if (value.endsWith('px')) return parseFloat(value)
  else return parseFloat(value) || 0
}
