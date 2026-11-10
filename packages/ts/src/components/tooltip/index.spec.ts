import { afterEach, describe, expect, it, vi } from 'vitest'
import { select } from 'd3-selection'
import { ComponentCore } from '@/core/component'
import { Position } from '@/types/position'
import { Tooltip } from './index'

describe('framework tooltip content', () => {
  const tooltips: Tooltip[] = []

  function createTooltip (): Tooltip {
    const tooltip = new Tooltip({ container: document.body, horizontalPlacement: Position.Left })
    tooltips.push(tooltip)
    return tooltip
  }

  afterEach(() => {
    tooltips.forEach(tooltip => tooltip.destroy())
    tooltips.length = 0
    document.body.replaceChildren()
    vi.useRealTimers()
  })

  it('passes selector context without replacing framework-owned DOM', () => {
    const tooltip = createTooltip()
    const datum = { value: 42 }
    const svg = select(document.body).append('svg')
    const group = svg.append('g')
    const point = group.append('circle').attr('class', 'point').datum(datum).node()
    const content = document.createElement('button')
    content.textContent = 'Native content'
    tooltip.contentElement.appendChild(content)
    const renderer = vi.fn()
    tooltip.setContentRenderer(renderer, ['point'])
    tooltip.setComponents([{ element: group.node() } as unknown as ComponentCore<unknown>])
    tooltip.update()

    point.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))

    expect(renderer).toHaveBeenCalledWith({ datum, index: 0, elements: [point], trigger: 'point' })
    expect(tooltip.contentElement.firstChild).toBe(content)
    group.node().dispatchEvent(new MouseEvent('mouseleave'))
    expect(renderer).toHaveBeenLastCalledWith(null)
  })

  it('routes heterogeneous native triggers and legacy HTML without replacing the native mount', () => {
    const tooltip = createTooltip()
    const group = select(document.body).append('svg').append('g')
    const datum = { value: 42 }
    const points = [datum, { value: 7 }]
    const point = group.append('circle').attr('class', 'point').datum(datum).node()
    const line = group.append('path').attr('class', 'line').datum(points).node()
    const label = group.append('text').attr('class', 'label').datum('Legacy').node()
    const nativeContent = document.createElement('button')
    tooltip.contentElement.appendChild(nativeContent)
    const renderer = vi.fn()
    const legacyPoint = vi.fn(() => 'Old point')
    tooltip.setContentRenderer(renderer, ['point', 'line'])
    tooltip.setConfig({
      ...tooltip.config,
      triggers: {
        point: legacyPoint,
        label: (text: string) => `<strong>${text}</strong>`,
      },
    })
    tooltip.setComponents([{ element: group.node() } as unknown as ComponentCore<unknown>])
    tooltip.update()

    // Legacy content can be the first trigger, and must not clear the native mount.
    label.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
    expect(tooltip.element.querySelector('strong')?.textContent).toBe('Legacy')
    expect(tooltip.contentElement.style.display).toBe('none')
    point.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
    expect(renderer).toHaveBeenLastCalledWith({ datum, index: 0, elements: [point], trigger: 'point' })
    expect(tooltip.contentElement.style.display).toBe('contents')
    expect(tooltip.element.querySelector('strong')?.parentElement.style.display).toBe('none')
    line.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
    expect(renderer).toHaveBeenLastCalledWith({ datum: points, index: 0, elements: [line], trigger: 'line' })
    expect(legacyPoint).not.toHaveBeenCalled()
    label.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
    expect(renderer).toHaveBeenLastCalledWith(null)
    expect(tooltip.contentElement.firstChild).toBe(nativeContent)
    tooltip.hide()
    tooltip.display()
    expect(renderer).toHaveBeenLastCalledWith(null)
  })


  it('renders vanilla content callbacks with HTML, elements, and null, ahead of legacy triggers', () => {
    const tooltip = createTooltip()
    const group = select(document.body).append('svg').append('g')
    const datum = { value: 42 }
    const point = group.append('circle').attr('class', 'point').datum(datum).node()
    const legacy = vi.fn(() => 'Legacy')
    const template = vi.fn(({ datum }) => `<strong>${datum.value}</strong>`)
    tooltip.setConfig({ ...tooltip.config, content: { point: template }, triggers: { point: legacy } })
    tooltip.setComponents([{ element: group.node() } as unknown as ComponentCore<unknown>])
    tooltip.update()
    point.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
    expect(template).toHaveBeenCalledWith({ datum, index: 0, elements: [point], trigger: 'point' })
    expect(tooltip.element.innerHTML).toBe('<strong>42</strong>')
    expect(legacy).not.toHaveBeenCalled()

    const button = document.createElement('button')
    const click = vi.fn()
    button.onclick = click
    tooltip.setConfig({ ...tooltip.config, content: { point: () => button } })
    point.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
    button.click()
    expect(click).toHaveBeenCalledOnce()
    expect(tooltip.element.firstChild).toBe(button)
    tooltip.setConfig({ ...tooltip.config, content: { point: () => null } })
    point.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
    expect(tooltip.div.classed(Tooltip.selectors.show)).toBe(false)

    tooltip.setConfig({ ...tooltip.config, content: undefined })
    point.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
    expect(legacy).toHaveBeenCalledOnce()
    expect(tooltip.element.innerHTML).toBe('Legacy')
  })


  it('preserves string and element rendering when native content is not registered', () => {
    const tooltip = createTooltip()
    tooltip.show('<strong>Legacy</strong>', { x: 20, y: 30 })
    expect(tooltip.element.innerHTML).toBe('<strong>Legacy</strong>')
    const element = document.createElement('span')
    tooltip.show(element, { x: 20, y: 30 })
    expect(tooltip.element.firstChild).toBe(element)
  })

  it('mounts native content after the show delay and restores it when displayed again', () => {
    vi.useFakeTimers()
    const tooltip = createTooltip()
    tooltip.setConfig({ ...tooltip.config, showDelay: 100 })
    const renderer = vi.fn()
    tooltip.setContentRenderer(renderer, ['point'])
    tooltip.show(undefined, { x: 20, y: 30 }, { datum: 42, trigger: 'point' })
    expect(renderer).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(renderer).toHaveBeenLastCalledWith({ datum: 42, trigger: 'point' })
    tooltip.hide()
    expect(renderer).toHaveBeenLastCalledWith(null)
    tooltip.display()
    vi.advanceTimersByTime(100)
    expect(renderer).toHaveBeenLastCalledWith({ datum: 42, trigger: 'point' })
  })

  it('clears native content after the hide delay and cancels a pending hide on show', () => {
    vi.useFakeTimers()
    const tooltip = createTooltip()
    tooltip.setConfig({ ...tooltip.config, hideDelay: 100 })
    const renderer = vi.fn()
    tooltip.setContentRenderer(renderer, ['point'])
    tooltip.show(undefined, { x: 20, y: 30 }, { datum: 1, trigger: 'point' })
    tooltip.hide()
    vi.advanceTimersByTime(50)
    expect(renderer).toHaveBeenLastCalledWith({ datum: 1, trigger: 'point' })
    tooltip.show(undefined, { x: 20, y: 30 }, { datum: 2, trigger: 'point' })
    vi.advanceTimersByTime(100)
    expect(renderer).toHaveBeenLastCalledWith({ datum: 2, trigger: 'point' })
    tooltip.hide()
    vi.advanceTimersByTime(100)
    expect(renderer).toHaveBeenLastCalledWith(null)
  })

  it('uses newly registered targets and restores legacy callbacks after unregistering native rendering', () => {
    const tooltip = createTooltip()
    const group = select(document.body).append('svg').append('g')
    const point = group.append('circle').attr('class', 'point').datum(42).node()
    const legacy = vi.fn(() => 'Legacy')
    const renderer = vi.fn()
    tooltip.setConfig({ ...tooltip.config, triggers: { point: legacy } })
    tooltip.setComponents([{ element: group.node() } as unknown as ComponentCore<unknown>])
    tooltip.update()
    tooltip.setContentRenderer(renderer, ['point'])
    point.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
    expect(renderer).toHaveBeenLastCalledWith({ datum: 42, trigger: 'point', index: 0, elements: [point] })
    expect(legacy).not.toHaveBeenCalled()
    tooltip.setContentRenderer(undefined)
    point.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
    expect(legacy).toHaveBeenCalledOnce()
    expect(tooltip.element.textContent).toBe('Legacy')
    expect(tooltip.contentElement.style.display).toBe('none')
  })

  it('falls back to legacy callbacks for undefined content entries', () => {
    const tooltip = createTooltip()
    const group = select(document.body).append('svg').append('g')
    const point = group.append('circle').attr('class', 'point').datum(42).node()
    const legacy = vi.fn(() => 'Fallback')
    tooltip.setConfig({ ...tooltip.config, content: { point: undefined }, triggers: { point: legacy } })
    tooltip.setComponents([{ element: group.node() } as unknown as ComponentCore<unknown>])
    tooltip.update()
    point.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
    expect(legacy).toHaveBeenCalledWith(42, 0, [point])
    expect(tooltip.element.textContent).toBe('Fallback')
  })

  it('renders only the latest native context after a delayed show', () => {
    vi.useFakeTimers()
    const tooltip = createTooltip()
    tooltip.setConfig({ ...tooltip.config, showDelay: 100 })
    const renderer = vi.fn()
    tooltip.setContentRenderer(renderer, ['point'])
    tooltip.show(undefined, { x: 100, y: 150 }, { datum: 1, trigger: 'point' })
    vi.advanceTimersByTime(50)
    tooltip.show(undefined, { x: 200, y: 250 }, { datum: 2, trigger: 'point' })
    vi.advanceTimersByTime(50)
    expect(renderer).not.toHaveBeenCalled()
    vi.advanceTimersByTime(50)
    expect(renderer).toHaveBeenCalledExactlyOnceWith({ datum: 2, trigger: 'point' })
  })
})
