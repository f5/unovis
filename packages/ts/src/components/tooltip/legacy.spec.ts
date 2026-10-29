import { afterEach, describe, expect, it, vi } from 'vitest'
import { select } from 'd3-selection'

import { ComponentCore } from '@/core/component'
import { Position } from '@/types/position'
import { Crosshair } from '../crosshair'
import { Tooltip } from './index'

describe('legacy tooltip compatibility', () => {
  const tooltips: Tooltip[] = []

  function createTooltip (config: ConstructorParameters<typeof Tooltip>[0] = {}): Tooltip {
    const tooltip = new Tooltip({ container: document.body, ...config })
    tooltips.push(tooltip)
    return tooltip
  }

  function createPoint (tooltip: Tooltip): SVGCircleElement {
    const group = select(document.body).append('svg').append('g')
    const point = group.append('circle').attr('class', 'point').datum({ value: 42 }).node()
    tooltip.setComponents([{ element: group.node() } as unknown as ComponentCore<unknown>])
    tooltip.update()
    return point
  }

  function move (element: Element): void {
    element.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 100, clientY: 150 }))
  }

  afterEach(() => {
    tooltips.forEach(tooltip => tooltip.destroy())
    tooltips.length = 0
    document.body.replaceChildren()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it.each([['', false], [undefined, false], ['', true], [undefined, true]] as const)(
    'retains HTML for empty content %s with native wrapper registration %s', (empty, native) => {
      let result: string | undefined = empty
      const tooltip = createTooltip({ triggers: { point: () => result } })
      if (native) tooltip.setContentRenderer(vi.fn(), [])
      const point = createPoint(tooltip)
      move(point)
      expect(tooltip.element.textContent).toBe('')
      expect(tooltip.div.classed(Tooltip.selectors.show)).toBe(true)
      result = '<b>Existing content</b>'
      move(point)
      const node = tooltip.element.firstChild
      result = empty
      move(point)
      expect(tooltip.element.firstChild).toBe(node)
      expect(tooltip.element.textContent).toBe('Existing content')
      expect(tooltip.div.classed(Tooltip.selectors.show)).toBe(true)
    })

  it('ignores nullable legacy trigger entries and allows them to be enabled later', () => {
    const tooltip = createTooltip({ triggers: { point: undefined, label: null } })
    const point = createPoint(tooltip)
    move(point)
    expect(tooltip.div.classed(Tooltip.selectors.show)).toBe(false)
    tooltip.setConfig({ ...tooltip.config, triggers: { point: () => 'Enabled', label: null } })
    move(point)
    expect(tooltip.element.textContent).toBe('Enabled')
    expect(tooltip.div.classed(Tooltip.selectors.show)).toBe(true)
    tooltip.setConfig({ ...tooltip.config, triggers: { point: null, label: undefined } })
    move(point)
    expect(tooltip.div.classed(Tooltip.selectors.show)).toBe(false)
  })

  it('hides on null, on unmatched targets, and on component exit', () => {
    let result: string | null = 'Existing content'
    const tooltip = createTooltip({ triggers: { point: () => result } })
    const point = createPoint(tooltip)
    move(point)
    result = null
    move(point)
    expect(tooltip.div.classed(Tooltip.selectors.show)).toBe(false)
    result = 'Restored'
    move(point)
    move(point.parentElement)
    expect(tooltip.div.classed(Tooltip.selectors.show)).toBe(false)
    move(point)
    point.parentElement.dispatchEvent(new MouseEvent('mouseleave'))
    expect(tooltip.div.classed(Tooltip.selectors.show)).toBe(false)
  })

  it('delegates nested targets with positional arguments and uses the latest callback', () => {
    const template = vi.fn(() => 'First')
    const tooltip = createTooltip({ triggers: { point: template } })
    const point = createPoint(tooltip)
    const sibling = select(point.parentElement).append('circle').attr('class', 'point').datum({ value: 7 }).node()
    const child = select(point.parentElement).append('g').attr('class', 'label').datum({ value: 3 })
    const nested = child.append('text').node()
    const nestedTemplate = vi.fn(() => 'Nested')
    tooltip.setConfig({ ...tooltip.config, triggers: { point: template, label: nestedTemplate } })
    move(sibling)
    expect(template).toHaveBeenCalledWith({ value: 7 }, 1, [point, sibling])
    move(nested)
    expect(nestedTemplate).toHaveBeenCalledWith({ value: 3 }, 0, [child.node()])
    const replacement = vi.fn(() => 'Updated')
    tooltip.setConfig({ ...tooltip.config, triggers: { point: replacement } })
    move(point)
    expect(replacement).toHaveBeenCalledWith({ value: 42 }, 0, [point, sibling])
    expect(tooltip.element.textContent).toBe('Updated')
  })

  it('does not replace repeated HTMLElement content or lose its event listeners', () => {
    const button = document.createElement('button')
    const clicked = vi.fn()
    button.addEventListener('click', clicked)
    const tooltip = createTooltip({ triggers: { point: () => button } })
    const point = createPoint(tooltip)
    move(point)
    button.focus()
    move(point)
    expect(tooltip.element.firstChild).toBe(button)
    expect(document.activeElement).toBe(button)
    button.click()
    expect(clicked).toHaveBeenCalledOnce()
  })

  it('preserves externally mounted portal content for undefined-returning callbacks', async () => {
    const tooltip = createTooltip({ triggers: { point: () => undefined } })
    tooltip.setContentRenderer(vi.fn(), [])
    const point = createPoint(tooltip)
    const portal = document.createElement('div')
    portal.textContent = 'Loading...'
    tooltip.element.appendChild(portal)
    move(point)
    portal.textContent = 'Loaded content'
    await Promise.resolve()
    move(point)
    expect(portal.parentElement).toBe(tooltip.element)
    expect(tooltip.element.textContent).toBe('Loaded content')
    expect(tooltip.div.classed(Tooltip.selectors.show)).toBe(true)
  })

  it('cancels a pending show when the pointer leaves and displays the latest position after a delay', () => {
    vi.useFakeTimers()
    const tooltip = createTooltip({ showDelay: 100, triggers: { point: () => 'Delayed' } })
    const point = createPoint(tooltip)
    move(point)
    vi.advanceTimersByTime(50)
    point.parentElement.dispatchEvent(new MouseEvent('mouseleave'))
    vi.advanceTimersByTime(100)
    expect(tooltip.div.classed(Tooltip.selectors.show)).toBe(false)
    move(point)
    tooltip.place({ x: 200, y: 250 })
    const place = vi.spyOn(tooltip, 'place')
    vi.advanceTimersByTime(100)
    expect(tooltip.div.classed(Tooltip.selectors.show)).toBe(true)
    expect(place).toHaveBeenLastCalledWith({ x: 200, y: 250 })
  })

  it('cancels a pending hide on tooltip entry, then hides after tooltip exit', () => {
    vi.useFakeTimers()
    const tooltip = createTooltip({ allowHover: true, hideDelay: 100, triggers: { point: () => 'Hoverable' } })
    const point = createPoint(tooltip)
    move(point)
    point.parentElement.dispatchEvent(new MouseEvent('mouseleave'))
    vi.advanceTimersByTime(50)
    tooltip.element.dispatchEvent(new MouseEvent('mouseenter'))
    vi.advanceTimersByTime(100)
    expect(tooltip.div.classed(Tooltip.selectors.show)).toBe(true)
    tooltip.element.dispatchEvent(new MouseEvent('mouseleave'))
    vi.advanceTimersByTime(100)
    expect(tooltip.div.classed(Tooltip.selectors.show)).toBe(false)
    tooltip.element.dispatchEvent(new Event('transitionend'))
    expect(tooltip.div.classed(Tooltip.selectors.hidden)).toBe(true)
  })

  it('ignores a stale hide transition after the tooltip has been shown again', () => {
    const tooltip = createTooltip()
    tooltip.show('First', { x: 100, y: 150 })
    tooltip.hide()
    tooltip.show('Second', { x: 100, y: 150 })
    tooltip.element.dispatchEvent(new Event('transitionend'))
    expect(tooltip.div.classed(Tooltip.selectors.hidden)).toBe(false)
    expect(tooltip.div.classed(Tooltip.selectors.show)).toBe(true)
  })

  it('updates classes and attributes without losing externally mounted content', () => {
    const tooltip = createTooltip({ className: 'initial', attributes: { 'data-tooltip': 'first' } })
    const node = document.createElement('span')
    tooltip.show(node, { x: 100, y: 150 })
    tooltip.setConfig({ ...tooltip.config, className: 'updated', allowHover: true, attributes: { 'data-tooltip': 'second' } })
    tooltip.render(undefined)
    expect(tooltip.element.classList.contains('initial')).toBe(false)
    expect(tooltip.element.classList.contains('updated')).toBe(true)
    expect(tooltip.element.getAttribute('data-tooltip')).toBe('second')
    expect(tooltip.div.classed(Tooltip.selectors.nonInteractive)).toBe(false)
    expect(node.parentElement).toBe(tooltip.element)
  })

  it('repositions dynamic content only while visible and disconnects on destroy', async () => {
    const tooltip = createTooltip()
    const content = document.createElement('span')
    tooltip.show(content, { x: 100, y: 150 })
    const place = vi.spyOn(tooltip, 'place')
    content.textContent = 'Loaded content'
    await Promise.resolve()
    expect(place).toHaveBeenLastCalledWith({ x: 100, y: 150 })
    place.mockClear()
    tooltip.hide()
    content.textContent = 'Hidden update'
    await Promise.resolve()
    expect(place).not.toHaveBeenCalled()
    tooltip.destroy()
    content.textContent = 'Detached update'
    await Promise.resolve()
    expect(place).not.toHaveBeenCalled()
    expect(tooltip.element.isConnected).toBe(false)
  })

  it('repositions anchored dynamic content by the hovered element', async () => {
    const tooltip = createTooltip({ followCursor: false, triggers: { point: () => '<span>Loading</span>' } })
    const point = createPoint(tooltip)
    move(point)
    const place = vi.spyOn(tooltip, 'placeByElement')
    tooltip.element.querySelector('span').textContent = 'Loaded'
    await Promise.resolve()
    expect(place).toHaveBeenLastCalledWith(point)
  })

  it.each(['show', 'hide'] as const)('clears a pending %s timer on destroy', (pending) => {
    vi.useFakeTimers()
    const tooltip = createTooltip({ showDelay: pending === 'show' ? 100 : 0, hideDelay: 100 })
    const renderer = vi.fn()
    tooltip.setContentRenderer(renderer, ['point'])
    tooltip.show(undefined, { x: 100, y: 150 }, { datum: 42, trigger: 'point' })
    if (pending === 'hide') tooltip.hide()
    renderer.mockClear()
    tooltip.destroy()
    vi.advanceTimersByTime(200)
    expect(renderer).not.toHaveBeenCalled()
    expect(tooltip.element.isConnected).toBe(false)
  })

  it('renders legacy Crosshair HTML and DOM with the native wrapper renderer registered', () => {
    const tooltip = createTooltip({ horizontalPlacement: Position.Right })
    const renderer = vi.fn()
    tooltip.setContentRenderer(renderer, [])
    const template = vi.fn(() => 'Crosshair HTML')
    const crosshair = new Crosshair<{ value: number }>({ tooltip, template })
    const data = [{ value: 42 }]
    crosshair.setData(data)
    crosshair._showTooltip(data[0], 10, [100, 150], 0)
    expect(template).toHaveBeenCalledWith(data[0], 10, data, 0)
    expect(tooltip.element.textContent).toBe('Crosshair HTML')
    expect(tooltip.config.followCursor).toBe(true)
    const element = document.createElement('span')
    element.textContent = 'Crosshair DOM'
    crosshair.setConfig({ ...crosshair.config, template: () => element })
    crosshair._showTooltip(undefined, 11, [100, 150], 0)
    expect(tooltip.element.contains(element)).toBe(true)
    expect(renderer.mock.calls.every(([context]) => context === null)).toBe(true)
    crosshair._hideTooltip()
    expect(tooltip.div.classed(Tooltip.selectors.show)).toBe(false)
    crosshair.destroy()
  })

  it.each([
    [Position.Left, Position.Top, 395, 255],
    [Position.Center, Position.Top, 450, 255],
    [Position.Right, Position.Top, 505, 255],
    [Position.Left, Position.Center, 395, 280],
    [Position.Center, Position.Center, 450, 280],
    [Position.Right, Position.Center, 505, 280],
    [Position.Left, Position.Bottom, 395, 305],
    [Position.Center, Position.Bottom, 450, 305],
    [Position.Right, Position.Bottom, 505, 305],
  ])('positions body tooltips at %s / %s', (horizontalPlacement, verticalPlacement, left, top) => {
    const tooltip = createTooltip({ horizontalPlacement, verticalPlacement })
    vi.spyOn(tooltip.element, 'offsetWidth', 'get').mockReturnValue(100)
    vi.spyOn(tooltip.element, 'offsetHeight', 'get').mockReturnValue(40)
    tooltip.show('Positioned', { x: 500, y: 300 })
    expect(tooltip.element.style.left).toBe(`${left}px`)
    expect(tooltip.element.style.top).toBe(`${top}px`)
    expect(tooltip.div.classed(Tooltip.selectors.positionFixed)).toBe(true)
  })

  it('applies shifts, automatic placement, and viewport constraints', () => {
    const tooltip = createTooltip({ horizontalPlacement: Position.Right, verticalPlacement: Position.Bottom, horizontalShift: 7, verticalShift: 9 })
    vi.spyOn(tooltip.element, 'offsetWidth', 'get').mockReturnValue(100)
    vi.spyOn(tooltip.element, 'offsetHeight', 'get').mockReturnValue(40)
    tooltip.show('Positioned', { x: 500, y: 300 })
    expect(tooltip.element.style.left).toBe('512px')
    expect(tooltip.element.style.top).toBe('314px')
    tooltip.setConfig({ ...tooltip.config, horizontalPlacement: Position.Auto, verticalPlacement: Position.Auto, horizontalShift: 0, verticalShift: 0 })
    tooltip.place({ x: 500, y: 20 })
    expect(tooltip.element.style.top).toBe('25px')
    tooltip.place({ x: -100, y: -100 })
    expect(tooltip.element.style.left).toBe('10px')
    expect(tooltip.element.style.top).toBe('10px')
    tooltip.place({ x: window.innerWidth + 100, y: window.innerHeight + 100 })
    expect(tooltip.element.style.left).toBe(`${window.innerWidth - 110}px`)
    expect(tooltip.element.style.top).toBe(`${window.innerHeight - 50}px`)
  })

  it('uses element coordinates in a scrolled local container and clears placement overrides on configuration changes', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    vi.spyOn(container, 'scrollWidth', 'get').mockReturnValue(400)
    vi.spyOn(container, 'scrollHeight', 'get').mockReturnValue(300)
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({ left: 10, top: -200 } as DOMRect)
    const tooltip = createTooltip({ container, followCursor: false, horizontalPlacement: Position.Auto, verticalPlacement: Position.Auto })
    vi.spyOn(tooltip.element, 'offsetWidth', 'get').mockReturnValue(100)
    vi.spyOn(tooltip.element, 'offsetHeight', 'get').mockReturnValue(40)
    const point = document.createElement('span')
    container.appendChild(point)
    vi.spyOn(point, 'getBoundingClientRect').mockReturnValue({ x: 50, y: -140, width: 20, height: 20 } as DOMRect)
    tooltip.render('Anchored')
    tooltip.placeByElement(point)
    expect(tooltip.element.style.left).toBe('65px')
    expect(tooltip.element.style.bottom).toBe('210px')
    expect(tooltip.div.classed(Tooltip.selectors.positionFixed)).toBe(false)
    tooltip.overrideHorizontalPlacement(Position.Left)
    tooltip.setConfig({ ...tooltip.config, horizontalPlacement: Position.Right })
    tooltip.place({ x: 100, y: 100 })
    expect(tooltip.element.style.left).toBe('105px')
  })

  it('moves between containers while retaining content and container availability', () => {
    const tooltip = createTooltip()
    tooltip.show('Retained', { x: 100, y: 150 })
    const container = document.createElement('div')
    document.body.appendChild(container)
    tooltip.setConfig({ ...tooltip.config, container })
    expect(tooltip.getContainer()).toBe(container)
    expect(tooltip.hasContainer()).toBe(true)
    expect(tooltip.element.parentElement).toBe(container)
    expect(tooltip.element.textContent).toBe('Retained')
    container.remove()
    expect(tooltip.hasContainer()).toBe(false)
  })
})
