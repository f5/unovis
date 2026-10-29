import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Core
import { XYContainer } from '@/containers/xy-container'
import { XYContainerConfigInterface } from '@/containers/xy-container/config'
import { Line } from '@/components/line'
import { Crosshair } from '@/components/crosshair'
import { CrosshairConfigInterface } from '@/components/crosshair/config'
import { Zoom } from '@/components/zoom'
import { Scale } from '@/types/scale'

// Utils
import { constrainDomain, getMinStep, transformDomain } from '@/components/zoom/utils'
import { getTextContent } from '@/components/crosshair/utils'

type Datum = { x: number; a: number; b: number }
type ContainerSetup = { element: HTMLDivElement; container: XYContainer<Datum>; line: Line<Datum>; crosshair: Crosshair<Datum>; zoom: Zoom<Datum>; onZoom: ReturnType<typeof vi.fn> }
type SetUpOptions = { zoom?: boolean; crosshair?: CrosshairConfigInterface<Datum> }

const data: Datum[] = Array.from({ length: 11 }, (_, i) => ({ x: i, a: i, b: 10 - i }))

function setUp (options: SetUpOptions = {}, config: XYContainerConfigInterface<Datum> = {}): ContainerSetup {
  const element = document.createElement('div')
  document.body.appendChild(element)

  const onZoom = vi.fn()
  const line = new Line<Datum>({ x: d => d.x, y: [d => d.a, d => d.b] })
  const crosshair = new Crosshair<Datum>({ duration: 0, ...options.crosshair })
  const zoom = options.zoom ? new Zoom<Datum>({ onZoom }) : undefined
  const container = new XYContainer<Datum>(element, { width: 500, height: 300, duration: 0, components: [line], crosshair, zoom, ...config }, data)
  vi.advanceTimersToNextFrame()

  return { element, container, line, crosshair, zoom, onZoom }
}

const getDomain = (line: Line<Datum>): number[] => line.xScale.domain().map(Number)
// Client X coordinate of the value (the container's bounding rect is at `0, 0` in jsdom)
const getClientX = (line: Line<Datum>, value: number): number => line.xScale(value)

function dispatch<E extends Event> (target: EventTarget, event: E): E {
  target.dispatchEvent(event)
  vi.advanceTimersToNextFrame()
  return event
}

const wheel = (init: WheelEventInit): WheelEvent => new WheelEvent('wheel', { bubbles: true, cancelable: true, ...init })
const pointer = (type: string, init: PointerEventInit): PointerEvent => new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, isPrimary: true, ...init })
const key = (k: string): KeyboardEvent => new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })

describe('XYContainer zoom utils', () => {
  const scale = Scale.scaleLinear().domain([0, 10]).range([0, 100])

  it('zooms around a point and pans', () => {
    expect(transformDomain(scale, 2, 50, 50)).toEqual([2.5, 7.5])
    expect(transformDomain(scale, 2, 0, 0)).toEqual([0, 5])
    expect(transformDomain(scale, 1, 50, 40)).toEqual([1, 11])
  })

  it('keeps the domain within the extent and wider than the minimum span', () => {
    expect(constrainDomain([-2, 3], [0, 10])).toEqual([0, 5])
    expect(constrainDomain([-5, 20], [0, 10])).toEqual([0, 10])
    // The anchor keeps its relative position when the span is limited
    expect(constrainDomain([4, 4.5], [0, 10], 2, 4)).toEqual([4, 6])
  })

  it('finds the smallest step between values', () => {
    expect(getMinStep([5, 1, 3, 3, 4])).toBe(1)
    expect(getMinStep([1])).toBeUndefined()
  })

  it('extracts the text of tooltip templates', () => {
    expect(getTextContent('<div>Date: <b>May 5</b></div><div>Value: 42</div>')).toBe('Date: May 5 Value: 42')
    expect(getTextContent('')).toBe('')
  })
})

describe('XYContainer zoom (jsdom)', () => {
  beforeEach(() => {
    // Also fakes `requestAnimationFrame`
    vi.useFakeTimers()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('zooms with the mouse wheel only when the chart is focused', () => {
    const { element, container, line, onZoom } = setUp({ zoom: true })
    expect(element.getAttribute('tabindex')).toBe('0')

    const ignored = dispatch(container.element, wheel({ deltaY: -100, clientX: getClientX(line, 5) }))
    expect(ignored.defaultPrevented).toBe(false)
    expect(getDomain(line)).toEqual([0, 10])

    element.focus()
    const zoomed = dispatch(container.element, wheel({ deltaY: -100, clientX: getClientX(line, 5) }))
    expect(zoomed.defaultPrevented).toBe(true)
    const [d0, d1] = getDomain(line)
    expect(d1 - d0).toBeCloseTo(10 / 2 ** 0.2)
    expect((d0 + d1) / 2).toBeCloseTo(5)
    expect(onZoom).toHaveBeenLastCalledWith([d0, d1], zoomed)
  })

  it('zooms with trackpad pinch (`ctrlKey`) right away, and pans with a horizontal scroll', () => {
    const { element, container, line } = setUp({ zoom: true })

    dispatch(container.element, wheel({ deltaY: -5, ctrlKey: true, clientX: getClientX(line, 0) }))
    const [d0, d1] = getDomain(line)
    expect(d0).toBeCloseTo(0)
    expect(d1).toBeCloseTo(10 / 2 ** 0.1)

    // Without focus, a horizontal scroll belongs to the page
    dispatch(container.element, wheel({ deltaX: 10, clientX: 100 }))
    expect(getDomain(line)).toEqual([d0, d1])

    element.focus()
    const step = (line.xScale.invert(10) as number) - (line.xScale.invert(0) as number)
    dispatch(container.element, wheel({ deltaX: 10, clientX: 100 }))
    expect(getDomain(line)[0]).toBeCloseTo(d0 + step)
  })

  it('stays within the data extent and the minimum span', () => {
    const { element, container, line } = setUp({ zoom: true })
    element.focus()

    dispatch(container.element, wheel({ deltaY: 500, clientX: 100 }))
    expect(getDomain(line)).toEqual([0, 10])

    for (let i = 0; i < 20; i += 1) dispatch(container.element, wheel({ deltaY: -500, clientX: getClientX(line, 5) }))
    const [d0, d1] = getDomain(line)
    expect(d1 - d0).toBeCloseTo(2) // Two data steps
  })

  it('pans with a mouse drag when zoomed, and resets on double click', () => {
    const { element, container, line, onZoom } = setUp({ zoom: true })
    element.focus()
    dispatch(container.element, wheel({ deltaY: -500, clientX: getClientX(line, 5) }))
    const [d0, d1] = getDomain(line)

    const x = getClientX(line, 5)
    const dx = getClientX(line, 6) - x
    dispatch(container.element, pointer('pointerdown', { pointerType: 'mouse', button: 0, buttons: 1, clientX: x }))
    dispatch(container.element, pointer('pointermove', { pointerType: 'mouse', buttons: 1, clientX: x - dx }))
    dispatch(container.element, pointer('pointerup', { pointerType: 'mouse', clientX: x - dx }))
    const panned = getDomain(line)
    expect(panned[0]).toBeCloseTo(d0 + 1)
    expect(panned[1]).toBeCloseTo(d1 + 1)

    dispatch(container.element, new MouseEvent('dblclick', { bubbles: true, cancelable: true }))
    expect(getDomain(line)).toEqual([0, 10])
    expect(onZoom).toHaveBeenLastCalledWith(undefined, expect.any(MouseEvent))
  })

  it('zooms and pans with two fingers', () => {
    const { container, line } = setUp({ zoom: true })
    expect(container.element.style.touchAction).toBe('none')

    const [x4, x5, x6] = [4, 5, 6].map(v => getClientX(line, v))
    dispatch(container.element, pointer('pointerdown', { pointerType: 'touch', pointerId: 1, clientX: x4 }))
    dispatch(container.element, pointer('pointerdown', { pointerType: 'touch', pointerId: 2, isPrimary: false, clientX: x6 }))
    // Spread the fingers twice as wide around the same center
    dispatch(container.element, pointer('pointermove', { pointerType: 'touch', pointerId: 1, clientX: x5 - 2 * (x5 - x4) }))
    dispatch(container.element, pointer('pointermove', { pointerType: 'touch', pointerId: 2, isPrimary: false, clientX: x5 + 2 * (x6 - x5) }))

    const [d0, d1] = getDomain(line)
    expect(d1 - d0).toBeCloseTo(5)
    expect((d0 + d1) / 2).toBeCloseTo(5)
  })

  it('leaves the wheel to the page without a Zoom', () => {
    const { element, container, line } = setUp()
    element.focus()

    const event = dispatch(container.element, wheel({ deltaY: -100, clientX: getClientX(line, 5) }))
    expect(event.defaultPrevented).toBe(false)
    expect(getDomain(line)).toEqual([0, 10])
  })

  it('makes a chart with a Zoom but without a Crosshair focusable, and zooms it with + and -', () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    const line = new Line<Datum>({ x: d => d.x, y: d => d.a })
    const container = new XYContainer<Datum>(element, { width: 500, height: 300, components: [line], zoom: new Zoom<Datum>() }, data)
    vi.advanceTimersToNextFrame()
    expect(element.getAttribute('tabindex')).toBe('0')

    dispatch(element, key('+'))
    const [d0, d1] = getDomain(line)
    expect(d1 - d0).toBeCloseTo(10 / 1.5)
    expect((d0 + d1) / 2).toBeCloseTo(5)

    container.updateContainer({ ...container.config, zoom: undefined })
    vi.advanceTimersToNextFrame()
    expect(element.hasAttribute('tabindex')).toBe(false)
    expect(getDomain(line)).toEqual([0, 10])

    // The removed Zoom doesn't handle the wheel anymore
    element.focus()
    const event = dispatch(container.element, wheel({ deltaY: -100, clientX: 100 }))
    expect(event.defaultPrevented).toBe(false)
  })

  it('replaces the zoomed domain with a new `xDomain` value', () => {
    const { element, container, line } = setUp({ zoom: true }, { xDomain: [0, 10] })
    element.focus()
    dispatch(container.element, wheel({ deltaY: -100, clientX: 100 }))
    const zoomed = getDomain(line)

    // Same value, different array: a framework wrapper re-render
    container.updateContainer({ ...container.config, xDomain: [0, 10] })
    vi.advanceTimersToNextFrame()
    expect(getDomain(line)).toEqual(zoomed)

    container.updateContainer({ ...container.config, xDomain: [2, 8] })
    vi.advanceTimersToNextFrame()
    expect(getDomain(line)).toEqual([2, 8])
  })
})

describe('XYContainer keyboard navigation (jsdom)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const getLiveRegion = (element: HTMLElement): HTMLElement => element.querySelector('[aria-live]')

  it('is enabled by default when there is a Crosshair', () => {
    const { element, container, crosshair } = setUp()
    expect(element.getAttribute('tabindex')).toBe('0')
    expect(getLiveRegion(element)).not.toBeNull()

    crosshair.setConfig({ ...crosshair.config, keyboardNavigation: false })
    container.updateContainer({ ...container.config })
    expect(element.hasAttribute('tabindex')).toBe(false)
    expect(getLiveRegion(element)).toBeNull()
  })

  it('moves the Crosshair between the data points and announces them', () => {
    const onCrosshairMove = vi.fn()
    const { element, line, crosshair } = setUp()
    crosshair.setConfig({ ...crosshair.config, onCrosshairMove })

    const right = dispatch(element, key('ArrowRight'))
    expect(right.defaultPrevented).toBe(true)
    expect(crosshair.line.attr('x1')).toBe(`${Math.round(line.xScale(0))}`)
    expect(onCrosshairMove).toHaveBeenLastCalledWith(0, data[0], 0, right)
    expect(getLiveRegion(element).textContent).toBe('0: 0, 10')

    dispatch(element, key('ArrowRight'))
    expect(crosshair.line.attr('x1')).toBe(`${Math.round(line.xScale(1))}`)

    dispatch(element, key('End'))
    expect(crosshair.line.attr('x1')).toBe(`${Math.round(line.xScale(10))}`)
    dispatch(element, key('PageUp'))
    expect(crosshair.line.attr('x1')).toBe(`${Math.round(line.xScale(9))}`)

    dispatch(element, key('Escape'))
    expect(crosshair.g.style('opacity')).toBe('0')
    expect(getLiveRegion(element).textContent).toBe('')
  })

  it('highlights the series from top to bottom', () => {
    const { element, crosshair } = setUp({ crosshair: { keyboardAnnouncement: (x, d, i, series) => `${x} ${series}` } })

    dispatch(element, key('ArrowRight'))
    dispatch(element, key('ArrowDown'))
    // At x = 0, `b` (10) is above `a` (0)
    expect(getLiveRegion(element).textContent).toBe('0 1')
    const radii = crosshair.g.selectAll('circle').nodes().map(c => (c as SVGCircleElement).getAttribute('r'))
    expect(radii.sort()).toEqual(['4', '6'])

    dispatch(element, key('ArrowDown'))
    expect(getLiveRegion(element).textContent).toBe('0 0')
    dispatch(element, key('ArrowDown'))
    expect(getLiveRegion(element).textContent).toBe('0 0')

    // The series stays highlighted when moving along X
    dispatch(element, key('End'))
    expect(getLiveRegion(element).textContent).toBe('10 0')
  })

  it('ignores the keys pressed in other elements inside the container', () => {
    const { element, crosshair } = setUp()
    const input = element.appendChild(document.createElement('input'))

    const event = dispatch(input, key('ArrowRight'))
    expect(event.defaultPrevented).toBe(false)
    expect(crosshair.g.style('opacity')).toBe('0')
  })

  it('reports the pointer position, not `forceShowAt`, to `onCrosshairMove`', () => {
    const onCrosshairMove = vi.fn()
    const { container, line, crosshair } = setUp()
    crosshair.setConfig({ ...crosshair.config, forceShowAt: 2, onCrosshairMove })

    dispatch(container.element, pointer('pointermove', { pointerType: 'mouse', clientX: getClientX(line, 7), clientY: 150 }))
    expect(onCrosshairMove).toHaveBeenLastCalledWith(expect.closeTo(7), expect.anything(), expect.any(Number), expect.any(PointerEvent))
  })

  it('uses the Crosshair template for the announcements', () => {
    const { element, crosshair } = setUp()
    crosshair.setConfig({ ...crosshair.config, template: (d: Datum) => `<b>X</b> ${d.x}` })

    dispatch(element, key('ArrowRight'))
    expect(getLiveRegion(element).textContent).toBe('X 0')
  })

  it('zooms with + and -, and pans the zoomed chart to keep the active data point visible', () => {
    const { element, line } = setUp({ zoom: true })

    dispatch(element, key('+'))
    dispatch(element, key('+'))
    const [d0, d1] = getDomain(line)
    expect(d1 - d0).toBeCloseTo(10 / 1.5 ** 2)

    dispatch(element, key('End'))
    const [p0, p1] = getDomain(line)
    expect(p1).toBeCloseTo(10)
    expect(p1 - p0).toBeCloseTo(d1 - d0)

    dispatch(element, key('-'))
    dispatch(element, key('-'))
    expect(getDomain(line)).toEqual([0, 10])
  })

  it('does not pan to a stale domain when a key is pressed before the reset zoom renders', () => {
    const { element, container, line } = setUp({ zoom: true })
    dispatch(element, key('+'))
    dispatch(element, key('End'))

    container.element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))
    element.dispatchEvent(key('Home'))
    vi.advanceTimersToNextFrame()
    expect(getDomain(line)).toEqual([0, 10])
  })
})
