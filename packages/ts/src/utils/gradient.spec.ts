import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getGradientFillValue } from '@/utils/gradient'

describe('gradient fills', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    document.body.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg"><g><rect/></g><g><rect/></g></svg>'
    svg = document.querySelector('svg')
  })

  afterEach(() => {
    svg.remove()
    vi.unstubAllGlobals()
  })

  it('works without a global SVGSVGElement constructor', () => {
    vi.stubGlobal('SVGSVGElement', undefined)

    expect(getGradientFillValue({}, 'red', svg)).toMatch(/^url\(#vis-gradient-/)
    expect(svg.querySelector('linearGradient')).not.toBeNull()
  })

  it('keeps matching recipes separate between CSS scopes', () => {
    const [first, second] = Array.from(svg.querySelectorAll('g'))
    first.style.setProperty('--series-color', 'red')
    second.style.setProperty('--series-color', 'blue')

    const firstFill = getGradientFillValue({}, 'var(--series-color)', first.querySelector('rect'))
    const secondFill = getGradientFillValue({}, 'var(--series-color)', second.querySelector('rect'))

    expect(firstFill).not.toBe(secondFill)
    expect(first.querySelector('defs > linearGradient > stop').getAttribute('style')).toContain('var(--series-color)')
    expect(second.querySelector('defs > linearGradient > stop').getAttribute('style')).toContain('var(--series-color)')
    expect(svg.querySelector(':scope > defs')).toBeNull()
  })

  it('reuses a gradient within its scope and preserves currentColor', () => {
    const scope = svg.querySelector('g')
    const rect = scope.querySelector('rect')
    scope.style.color = 'red'

    const fill = getGradientFillValue({}, 'currentColor', rect)
    scope.style.color = 'blue'

    expect(getGradientFillValue({}, 'currentColor', rect)).toBe(fill)
    expect(scope.querySelectorAll('linearGradient')).toHaveLength(1)
    expect(scope.querySelector('stop').style.stopColor.toLowerCase()).toBe('currentcolor')
  })
})
