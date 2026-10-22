import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'

// Config
import { DonutConfigInterface } from './config'

// Local Types
import { DonutIconDatum } from './types'

// Local Utils
import { getArcBisectorClearance } from './utils'

// Component
import { Donut } from './index'

vi.hoisted(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
})

afterAll(() => vi.useRealTimers())

describe('getArcBisectorClearance', () => {
  it('is limited by the sides of a narrow arc', () => {
    expect(getArcBisectorClearance(0, 0.1, 0, 60, 100, 80)).toBeCloseTo(80 * Math.sin(0.05))
  })

  it('is limited by the inner and outer edges of an arc of 180° and more', () => {
    expect(getArcBisectorClearance(0, Math.PI, 0, 60, 100, 70)).toBeCloseTo(10)
    expect(getArcBisectorClearance(0, 2 * Math.PI, 0, 60, 100, 95)).toBeCloseTo(5)
  })

  it('accounts for the pad inset of the sides', () => {
    const padRadius = Math.sqrt(60 * 60 + 100 * 100)
    expect(getArcBisectorClearance(0, 0.4, 0.05, 60, 100, 80)).toBeCloseTo(80 * Math.sin(0.2) - padRadius * Math.sin(0.025))
  })

  it('is negative when the padding consumes the arc', () => {
    expect(getArcBisectorClearance(0, 0.05, 0.05, 60, 100, 80)).toBeLessThan(0)
  })
})

describe('Donut icons', () => {
  let donut: Donut<number>

  function render (data: number[], config: Partial<DonutConfigInterface<number>> = {}, duration = 0): void {
    donut = donut ?? new Donut<number>()
    donut.setConfig({ value: d => d, icon: '#heart', radius: 100, arcWidth: 40, ...config })
    donut.setData(data)
    donut.setSize(200, 200, 200, 200)
    donut.render(duration)
  }

  function getIcons (): { index: number; size: number; opacity: number }[] {
    const icons = donut.iconGroup.selectAll<SVGGElement, DonutIconDatum<number>>(`.${Donut.selectors.icon}`)
    const data = icons.data()
    return icons.nodes()
      .map((node, i) => ({
        index: data[i].index,
        size: +node.querySelector('use').getAttribute('width'),
        opacity: +node.style.opacity,
      }))
      .sort((a, b) => a.index - b.index)
  }

  const getOpacities = (): number[] => getIcons().map(d => d.opacity)

  afterEach(() => {
    donut?.g.selectAll('*').interrupt()
    donut?.destroy()
    donut = undefined
  })

  it('hides the icons of slices too small to fit them', () => {
    render([50, 49, 1])
    expect(getOpacities()).toEqual([1, 1, 0])
  })

  it('fades the icon out when its slice shrinks and back in when it grows', async () => {
    render([50, 50, 20])
    expect(getOpacities()).toEqual([1, 1, 1])

    render([50, 50, 0.5], {}, 300)
    await vi.advanceTimersByTimeAsync(400)
    expect(getOpacities()).toEqual([1, 1, 0])

    render([50, 50, 20], {}, 300)
    await vi.advanceTimersByTimeAsync(400)
    expect(getOpacities()).toEqual([1, 1, 1])
  })

  it('hides the icons that are too large for the arc width', () => {
    render([1, 1], { iconSize: 30 })
    expect(getOpacities()).toEqual([1, 1])

    render([1, 1], { iconSize: 40 })
    expect(getOpacities()).toEqual([0, 0])
  })

  it('hides the icon when the pad angle leaves too little room for it', () => {
    // The small slice fits a 10px icon without padding, but the pad inset of its sides makes it too narrow
    render([39, 1], { iconSize: 10 })
    expect(getOpacities()).toEqual([1, 1])

    render([39, 1], { iconSize: 10, padAngle: 0.05 })
    expect(getOpacities()).toEqual([1, 0])
  })

  it('caps the default icon size at 20px unless the size is set', () => {
    render([1, 1], { radius: 400, arcWidth: 100 })
    expect(getIcons().map(d => d.size)).toEqual([20, 20])

    render([1, 1], { radius: 100, arcWidth: 0 })
    expect(getIcons().map(d => d.size)).toEqual([15, 15])

    render([1, 1], { radius: 400, arcWidth: 100, iconSize: 32 })
    expect(getIcons().map(d => d.size)).toEqual([32, 32])
  })

  it.each([
    ['&#xf004;', ''],
    ['<img src=x onerror=alert(1)>', ''],
    ['<script>alert(1)</script>', 'alert(1)'],
    ['<svg onload=alert(1)><circle r="5"/></svg>', ''],
    ['<<script>script>alert(1)<</script>/script>', 'alert(1)'],
    ['<img src=x onerror=alert(1)//', ''],
    ['&lt;img src=x onerror=alert(1)&gt;', '<img src=x onerror=alert(1)>'],
    ['<a href="javascript:alert(1)">x</a>', 'x'],
    ['<foreignObject><div onmouseover="alert(1)">x</div></foreignObject>', 'x'],
    ['javascript:alert(1)', 'javascript:alert(1)'],
  ])('renders the text icon %j as plain text', (icon, text) => {
    render([1], { icon })
    const node = donut.iconGroup.select<SVGGElement>(`.${Donut.selectors.icon}`).node()
    expect([...node.querySelectorAll('*')].map(el => el.tagName)).toEqual(['text'])
    expect(node.querySelector('text').textContent).toBe(text)
  })

  it('sets a href icon as a single attribute', () => {
    render([1], { icon: '#heart" onload="alert(1)' })
    const use = donut.iconGroup.select<SVGUseElement>('use').node()
    expect(use.getAttributeNames().sort()).toEqual(['height', 'href', 'width', 'x', 'y'])
    expect(use.getAttribute('href')).toBe('#heart" onload="alert(1)')
  })
})
