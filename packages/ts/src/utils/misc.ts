import { StringAccessor } from '@/types/accessor'
import { LengthUnit, Rect } from '@/types/misc'
import { getString, isString } from '@/utils/data'
import { toPx } from 'utils/to-px'

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

function evaluateSimpleExpression (expr: string): number {
  // Handle multiplication and division first (higher precedence)
  // Keep applying until no more operations are found
  while (/(-?\d+(?:\.\d+)?)\s*([*/])\s*(-?\d+(?:\.\d+)?)/.test(expr)) {
    expr = expr.replace(/(-?\d+(?:\.\d+)?)\s*([*/])\s*(-?\d+(?:\.\d+)?)/, (_, a, op, b) => {
      const numA = parseFloat(a)
      const numB = parseFloat(b)
      return String(op === '*' ? numA * numB : numA / numB)
    })
  }

  // Handle addition and subtraction (lower precedence)
  // Keep applying until no more operations are found
  while (/(-?\d+(?:\.\d+)?)\s*([+-])\s*(-?\d+(?:\.\d+)?)/.test(expr)) {
    expr = expr.replace(/(-?\d+(?:\.\d+)?)\s*([+-])\s*(-?\d+(?:\.\d+)?)/, (_, a, op, b) => {
      const numA = parseFloat(a)
      const numB = parseFloat(b)
      return String(op === '+' ? numA + numB : numA - numB)
    })
  }

  const result = parseFloat(expr)
  if (isNaN(result)) throw new Error(`Invalid expression: ${expr}`)
  return result
}

function evaluateCalcExpression (expression: string, basis: number): number {
  try {
    // Replace percentages and pixels with resolved values
    let expr = expression
      .replace(/(\d+(?:\.\d+)?)%/g, (_, num) => String((basis * parseFloat(num)) / 100))
      .replace(/(\d+(?:\.\d+)?)px/g, '$1')
      .replace(/\s+/g, '')

    // Validate parentheses pairs before processing
    let parenCount = 0
    for (const char of expr) {
      if (char === '(') parenCount++
      else if (char === ')') parenCount--
      if (parenCount < 0) throw new Error('Mismatched parentheses: closing parenthesis without opening')
    }
    if (parenCount !== 0) throw new Error('Mismatched parentheses: unclosed opening parenthesis')

    // Check for invalid characters (only allow numbers, operators, decimal points, and parentheses)
    if (!/^[0-9+\-*/.() ]+$/.test(expr)) throw new Error('Invalid characters in expression')

    // Check for empty parentheses
    if (/\(\s*\)/.test(expr)) throw new Error('Empty parentheses not allowed')

    // Simple regex-based evaluation for basic expressions
    // Handles: number, number+number, number-number, number*number, number/number
    // And simple parentheses: (expression)

    // Evaluate parentheses first
    let iterations = 0
    const maxIterations = 100 // Prevent infinite loops
    while (expr.includes('(') && iterations < maxIterations) {
      const prevExpr = expr
      expr = expr.replace(/\(([^()]+)\)/g, (_, inner) => String(evaluateSimpleExpression(inner)))
      if (expr === prevExpr) throw new Error('Unable to resolve parentheses')
      iterations++
    }

    if (iterations >= maxIterations) throw new Error('Expression too complex or contains infinite recursion')
    if (expr.includes('(') || expr.includes(')')) throw new Error('Unresolved parentheses remain')

    return evaluateSimpleExpression(expr)
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
