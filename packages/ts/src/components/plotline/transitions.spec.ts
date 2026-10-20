import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'

import { AxisType } from '@/components/axis/types'
import { Plotband } from '@/components/plotband'
import { Plotline } from './index'

vi.hoisted(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
})

afterAll(() => vi.useRealTimers())

describe.each(['line', 'band'] as const)('Plot%s visibility transitions', (kind) => {
  let mark: Plotline<unknown> | Plotband<unknown>

  function createMark (axis = AxisType.X): void {
    mark = kind === 'line' ? new Plotline({ axis, value: 6 }) : new Plotband({ axis, from: 2, to: 6 })
    mark.setSize(400, 200, 400, 200)
    mark.xScale.domain([0, 10]).range([0, 400])
    mark.yScale.domain([0, 10]).range([200, 0])
  }

  function geometry (): number[] {
    return mark instanceof Plotline
      ? ['x1', 'y1', 'x2', 'y2'].map(attr => +mark.plotline.attr(attr))
      : ['x', 'y', 'width', 'height'].map(attr => +mark.plotband.attr(attr))
  }

  function setVisible (visible: boolean): void {
    if (mark instanceof Plotline) mark.setConfig({ ...mark.config, value: visible ? 6 : null })
    else mark.setConfig({ ...mark.config, from: visible ? 2 : null })
  }

  afterEach(() => {
    mark?.g.selectAll('*').interrupt()
    mark?.g.interrupt()
    mark?.destroy()
  })

  it.each([AxisType.X, AxisType.Y])('sets full %s geometry before the enter fade', (axis) => {
    createMark(axis)
    mark.render(300)

    const expected = kind === 'line'
      ? axis === AxisType.X ? [240, 0, 240, 200] : [0, 80, 400, 80]
      : axis === AxisType.X ? [80, 0, 160, 200] : [0, 80, 400, 80]
    expect(geometry()).toEqual(expected)
    expect(mark.g.style('opacity')).toBe('0')
    expect(mark.g.style('display')).not.toBe('none')
  })

  it('keeps geometry while fading out and does not restart an exit on repeated renders', async () => {
    createMark()
    mark.render(0)
    const before = geometry()
    setVisible(false)
    mark.render(100)
    expect(mark.g.style('display')).not.toBe('none')
    expect(mark.g.style('pointer-events')).toBe('none')

    await vi.advanceTimersByTimeAsync(64)
    expect(+mark.g.style('opacity')).toBeGreaterThan(0)
    expect(+mark.g.style('opacity')).toBeLessThan(1)
    expect(geometry()).toEqual(before)
    mark.render(100)
    await vi.advanceTimersByTimeAsync(64)
    expect(mark.g.style('display')).toBe('none')
  })

  it('cancels a pending hide when the value becomes defined again', async () => {
    createMark()
    mark.render(0)
    setVisible(false)
    mark.render(100)
    await vi.advanceTimersByTimeAsync(48)
    setVisible(true)
    mark.render(100)
    await vi.advanceTimersByTimeAsync(160)

    expect(mark.g.style('display')).not.toBe('none')
    expect(mark.g.style('opacity')).toBe('1')
    expect(mark.g.style('pointer-events')).not.toBe('none')
  })

  it('continues to animate position updates while visible', async () => {
    createMark()
    mark.render(0)
    const before = geometry()
    if (mark instanceof Plotline) mark.setConfig({ ...mark.config, value: 8 })
    else mark.setConfig({ ...mark.config, from: 3, to: 8 })
    mark.render(100)
    expect(geometry()).toEqual(before)
    expect(mark.g.style('opacity')).toBe('1')
    await vi.advanceTimersByTimeAsync(64)
    expect(geometry()).not.toEqual(before)
    await vi.advanceTimersByTimeAsync(64)
    expect(geometry()).toEqual(kind === 'line' ? [320, 0, 320, 200] : [120, 0, 200, 200])
  })

  it('shows and hides immediately with zero duration', () => {
    createMark()
    mark.render(0)
    expect(mark.g.style('opacity')).toBe('1')
    setVisible(false)
    mark.render(0)
    expect(mark.g.style('display')).toBe('none')
    setVisible(true)
    mark.render(0)
    expect(mark.g.style('display')).not.toBe('none')
    expect(mark.g.style('opacity')).toBe('1')
  })
})
