import { StringAccessor } from '@/types/accessor'
import { LengthUnit, Rect } from '@/types/misc'
import { getString, isString } from '@/utils/data'
import { toPx } from '@/utils/to-px'

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

const cssVariableCache = new WeakMap<HTMLElement | SVGElement, Map<string, string>>()
export function getCSSVariableValue (s: string, context: HTMLElement | SVGElement): string {
  if (!isString(s)) return ''
  const variableName = s.substr(4, s.length - 5)


  let elementCache = cssVariableCache.get(context)
  if (!elementCache) {
    elementCache = new Map()
    cssVariableCache.set(context, elementCache)
  }

  if (elementCache.has(variableName)) {
    return elementCache.get(variableName)
  }

  const value = getComputedStyle(context).getPropertyValue(variableName)
  elementCache.set(variableName, value)
  return value
}

export function getCSSVariableValueInPixels (s: string, context: HTMLElement | SVGElement): number {
  const val = getCSSVariableValue(s, context)
  return toPx(val)
}

export function getPixelValue (v: string | number): number | null {
  return typeof v === 'number' ? v : toPx(v)
}

/** Returns the axis-aligned bounding box of `rect` rotated by `angleRad` around the origin */
export function getRotatedRectAabb (rect: Rect, angleRad: number): Rect {
  const sin = Math.sin(angleRad)
  const cos = Math.cos(angleRad)
  const corners = [
    [rect.x, rect.y],
    [rect.x + rect.width, rect.y],
    [rect.x, rect.y + rect.height],
    [rect.x + rect.width, rect.y + rect.height],
  ]
  const xs = corners.map(([x, y]) => x * cos - y * sin)
  const ys = corners.map(([x, y]) => x * sin + y * cos)

  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}

/** Returns the translation needed to fit `rect` into `bounds`.
 * When the rect is larger than the bounds, fitting its top left corner takes priority. */
export function getRectFitTranslation (rect: Rect, bounds: Rect): { dx: number; dy: number } {
  return {
    dx: Math.max(bounds.x - rect.x, Math.min(0, bounds.x + bounds.width - rect.x - rect.width)),
    dy: Math.max(bounds.y - rect.y, Math.min(0, bounds.y + bounds.height - rect.y - rect.height)),
  }
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

function evaluateCalcExpression (expression: string, basis: number): number {
  const maxNestingDepth = 99
  try {
    const tokens = expression.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:%|px)?|\S/g) ?? []
    let index = 0

    function readSum (depth: number): number {
      function readOperand (): number {
        let token = tokens[index++]
        const sign = token === '-' ? -1 : 1
        if (token === '-' || token === '+') token = tokens[index++]

        if (token === '(') {
          if (depth === maxNestingDepth) throw new Error('Expression nested too deeply')
          const value = readSum(depth + 1)
          if (tokens[index++] !== ')') throw new Error('Expected closing parenthesis')
          return sign * value
        }

        const value = parseFloat(token)
        if (Number.isNaN(value)) throw new Error('Expected a number')
        return sign * (token.endsWith('%') ? basis * value / 100 : value)
      }

      function readProduct (): number {
        let value = readOperand()
        while (tokens[index] === '*' || tokens[index] === '/') {
          const operator = tokens[index++]
          const right = readOperand()
          value = operator === '*' ? value * right : value / right
        }
        return value
      }

      let value = readProduct()
      while (tokens[index] === '+' || tokens[index] === '-') {
        const operator = tokens[index++]
        const right = readProduct()
        value = operator === '+' ? value + right : value - right
      }
      return value
    }

    const result = readSum(0)
    if (index !== tokens.length || !Number.isFinite(result)) throw new Error('Invalid expression')
    return result
  } catch (error) {
    console.warn(`Failed to evaluate calc() expression: ${expression}`, error)
    return 0
  }
}

export function parseUnit (value: LengthUnit, basis = 0): number {
  if (!value) return 0
  else if (typeof value === 'number') return value
  else if (typeof value === 'string' && value.startsWith('calc(') && value.endsWith(')')) {
    // Parse calc() expression
    const expression = value.slice(5, -1).trim() // Remove 'calc(' and ')'
    return evaluateCalcExpression(expression, basis)
  } else if (value.endsWith('%')) return basis * parseFloat(value) / 100
  else if (value.endsWith('px')) return parseFloat(value)
  else return parseFloat(value) || 0
}
