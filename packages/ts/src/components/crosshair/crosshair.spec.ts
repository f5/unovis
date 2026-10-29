import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { select } from 'd3-selection'

// Core
import { ComponentCore } from '@/core/component'
import { XYContainer } from '@/containers/xy-container'
import { Crosshair } from '@/components/crosshair'
import { Tooltip } from '@/components/tooltip'

// Types
import { ScaleDimension } from '@/types/scale'
import { CrosshairCircle } from '@/components/crosshair/types'

// Config
import { CrosshairConfigInterface } from '@/components/crosshair/config'

const SVG_NS = 'http://www.w3.org/2000/svg'

type Datum = { x: number; y: number }
type TooltipInternals = { _setUpEvents: () => void }
type CrosshairSetup = { svg: SVGSVGElement; crosshair: Crosshair<Datum>; onCrosshairMove: ReturnType<typeof vi.fn> }

function pointerEvent (type: string, init: PointerEventInit = {}): PointerEvent {
  return new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, pointerId: 1, isPrimary: true, ...init })
}

function setUpCrosshair (): CrosshairSetup {
  const svg = document.createElementNS(SVG_NS, 'svg')
  document.body.appendChild(svg)
  // Crosshair is shown only when its container is visible in the viewport
  vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, left: 0, top: 0, width: 500, height: 300, right: 500, bottom: 300 } as DOMRect)

  const onCrosshairMove = vi.fn()
  const crosshair = new Crosshair<Datum>({ x: d => d.x, y: d => d.y, duration: 0, onCrosshairMove })
  svg.appendChild(crosshair.element)
  crosshair.setContainer(select(svg))
  crosshair.setData([{ x: 0, y: 0 }, { x: 5, y: 5 }, { x: 10, y: 10 }])
  crosshair.setSize(500, 300, 500, 300)
  crosshair.setScaleDomain(ScaleDimension.X, [0, 10])
  crosshair.setScaleRange(ScaleDimension.X, [0, 500])
  crosshair.setScaleDomain(ScaleDimension.Y, [0, 10])
  crosshair.setScaleRange(ScaleDimension.Y, [300, 0])

  return { svg, crosshair, onCrosshairMove }
}

const isShown = (crosshair: Crosshair<Datum>): boolean => crosshair.g.style('opacity') === '1'

describe('Crosshair pointer events (jsdom)', () => {
  beforeEach(() => {
    // Also fakes `requestAnimationFrame`
    vi.useFakeTimers()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('mouse', () => {
    it('shows on pointermove and reports the nearest datum', () => {
      const { svg, crosshair, onCrosshairMove } = setUpCrosshair()

      const e = pointerEvent('pointermove', { pointerType: 'mouse', clientX: 240, clientY: 150 })
      svg.dispatchEvent(e)
      vi.advanceTimersToNextFrame()

      expect(isShown(crosshair)).toBe(true)
      expect(crosshair.line.attr('x1')).toBe('250')
      expect(onCrosshairMove).toHaveBeenLastCalledWith(expect.closeTo(4.8), { x: 5, y: 5 }, 1, e)
    })

    it('hides on pointerout only when the pointer leaves the container', () => {
      const { svg, crosshair, onCrosshairMove } = setUpCrosshair()
      svg.dispatchEvent(pointerEvent('pointermove', { pointerType: 'mouse', clientX: 240, clientY: 150 }))
      vi.advanceTimersToNextFrame()

      svg.dispatchEvent(pointerEvent('pointerout', { pointerType: 'mouse', relatedTarget: crosshair.element }))
      vi.advanceTimersToNextFrame()
      expect(isShown(crosshair)).toBe(true)

      const e = pointerEvent('pointerout', { pointerType: 'mouse', relatedTarget: document.body })
      svg.dispatchEvent(e)
      vi.advanceTimersToNextFrame()
      expect(isShown(crosshair)).toBe(false)
      expect(onCrosshairMove).toHaveBeenLastCalledWith(undefined, undefined, undefined, e)
    })

    it('ignores pointerdown and pointerup', () => {
      const { svg, crosshair } = setUpCrosshair()

      svg.dispatchEvent(pointerEvent('pointerdown', { pointerType: 'mouse', clientX: 240, clientY: 150 }))
      vi.advanceTimersToNextFrame()
      expect(isShown(crosshair)).toBe(false)

      svg.dispatchEvent(pointerEvent('pointermove', { pointerType: 'mouse', clientX: 240, clientY: 150 }))
      svg.dispatchEvent(pointerEvent('pointerup', { pointerType: 'mouse', clientX: 240, clientY: 150 }))
      vi.advanceTimersToNextFrame()
      expect(isShown(crosshair)).toBe(true)
    })
  })

  describe('touch', () => {
    it('shows on pointerdown, follows pointermove and hides on pointerup', () => {
      const { svg, crosshair, onCrosshairMove } = setUpCrosshair()
      const documentListener = vi.fn()
      document.addEventListener('pointerdown', documentListener)

      // Doesn't prevent the default action (scrolling, clicks) or stop the propagation
      const pointerDown = pointerEvent('pointerdown', { pointerType: 'touch', clientX: 240, clientY: 150 })
      svg.dispatchEvent(pointerDown)
      expect(pointerDown.defaultPrevented).toBe(false)
      expect(documentListener).toHaveBeenCalledTimes(1)
      document.removeEventListener('pointerdown', documentListener)

      vi.advanceTimersToNextFrame()
      expect(isShown(crosshair)).toBe(true)
      expect(crosshair.line.attr('x1')).toBe('250')

      svg.dispatchEvent(pointerEvent('pointermove', { pointerType: 'touch', clientX: 480, clientY: 150 }))
      vi.advanceTimersToNextFrame()
      expect(crosshair.line.attr('x1')).toBe('500')

      const e = pointerEvent('pointerup', { pointerType: 'touch', clientX: 480, clientY: 150 })
      svg.dispatchEvent(e)
      vi.advanceTimersToNextFrame()
      expect(isShown(crosshair)).toBe(false)
      expect(onCrosshairMove).toHaveBeenLastCalledWith(undefined, undefined, undefined, e)
    })

    it('ignores all the fingers except the first one', () => {
      const { svg, crosshair } = setUpCrosshair()

      svg.dispatchEvent(pointerEvent('pointerdown', { pointerType: 'touch', clientX: 240, clientY: 150 }))
      svg.dispatchEvent(pointerEvent('pointerdown', { pointerType: 'touch', pointerId: 2, isPrimary: false, clientX: 480, clientY: 150 }))
      svg.dispatchEvent(pointerEvent('pointermove', { pointerType: 'touch', pointerId: 2, isPrimary: false, clientX: 480, clientY: 150 }))
      svg.dispatchEvent(pointerEvent('pointerup', { pointerType: 'touch', pointerId: 2, isPrimary: false, clientX: 480, clientY: 150 }))
      svg.dispatchEvent(pointerEvent('pointerout', { pointerType: 'touch', pointerId: 2, isPrimary: false, clientX: 480, clientY: 150 }))
      vi.advanceTimersToNextFrame()
      expect(isShown(crosshair)).toBe(true)
      expect(crosshair.line.attr('x1')).toBe('250')
    })

    it('hides on pointerout without `relatedTarget` (Safari) only when the finger is outside of the container', () => {
      const { svg, crosshair } = setUpCrosshair()
      const elementFromPoint = vi.fn()
      Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: elementFromPoint })

      svg.dispatchEvent(pointerEvent('pointerdown', { pointerType: 'touch', clientX: 240, clientY: 150 }))
      elementFromPoint.mockReturnValue(crosshair.element)
      svg.dispatchEvent(pointerEvent('pointerout', { pointerType: 'touch', clientX: 260, clientY: 150 }))
      vi.advanceTimersToNextFrame()
      expect(elementFromPoint).toHaveBeenLastCalledWith(260, 150)
      expect(isShown(crosshair)).toBe(true)

      elementFromPoint.mockReturnValue(document.body)
      svg.dispatchEvent(pointerEvent('pointerout', { pointerType: 'touch', clientX: 900, clientY: 150 }))
      vi.advanceTimersToNextFrame()
      expect(isShown(crosshair)).toBe(false)

      delete (document as Partial<Document>).elementFromPoint
    })

    it('hides on pointercancel', () => {
      const { svg, crosshair } = setUpCrosshair()

      svg.dispatchEvent(pointerEvent('pointerdown', { pointerType: 'touch', clientX: 240, clientY: 150 }))
      vi.advanceTimersToNextFrame()
      // Browsers fire `pointercancel` with zero coordinates when they take over the gesture to scroll the page
      svg.dispatchEvent(pointerEvent('pointercancel', { pointerType: 'touch', clientX: 0, clientY: 0 }))
      vi.advanceTimersToNextFrame()
      expect(isShown(crosshair)).toBe(false)
    })
  })

  describe('with XYContainer', () => {
    it('lets the finger drag the Crosshair by setting `touch-action` on the container, unless `followTouchMove` is `false`', () => {
      const element = document.createElement('div')
      document.body.appendChild(element)
      const crosshair = new Crosshair<Datum>({ x: d => d.x, y: d => d.y })
      const container = new XYContainer<Datum>(element, { crosshair, components: [] }, [{ x: 0, y: 0 }, { x: 1, y: 1 }])
      const svg = container.svg.node() as SVGSVGElement
      container.render(0)
      vi.advanceTimersToNextFrame()
      expect(svg.style.touchAction).toBe('pinch-zoom')

      crosshair.setConfig({ ...crosshair.config, followTouchMove: false })
      container.render(0)
      vi.advanceTimersToNextFrame()
      expect(svg.style.touchAction).toBe('')

      container.updateContainer({ crosshair: new Crosshair<Datum>({ x: d => d.x, y: d => d.y }), components: [] })
      container.render(0)
      vi.advanceTimersToNextFrame()
      expect(svg.style.touchAction).toBe('pinch-zoom')

      container.updateContainer({ crosshair: undefined, components: [] })
      container.render(0)
      vi.advanceTimersToNextFrame()
      expect(svg.style.touchAction).toBe('')
      container.destroy()
    })
  })

  describe('with Tooltip', () => {
    it('ignores the events that have reached one of the Tooltip triggers', () => {
      const { svg, crosshair, onCrosshairMove } = setUpCrosshair()
      const g = document.createElementNS(SVG_NS, 'g')
      const background = document.createElementNS(SVG_NS, 'rect')
      g.appendChild(background)
      svg.appendChild(g)
      select(g).append('path').datum('A').attr('class', 'segment')

      const container = document.createElement('div')
      document.body.appendChild(container)
      const tooltip = new Tooltip({ container, triggers: { segment: (d: string) => `Segment ${d}` } })
      tooltip.setComponents([{ element: g } as unknown as ComponentCore<unknown>])
      ;(tooltip as unknown as TooltipInternals)._setUpEvents()
      crosshair.tooltip = tooltip

      g.querySelector('path').dispatchEvent(pointerEvent('pointerdown', { pointerType: 'touch', clientX: 240, clientY: 150 }))
      g.querySelector('path').dispatchEvent(pointerEvent('pointermove', { pointerType: 'mouse', clientX: 240, clientY: 150 }))
      vi.advanceTimersToNextFrame()
      expect(isShown(crosshair)).toBe(false)
      expect(onCrosshairMove).not.toHaveBeenCalled()

      background.dispatchEvent(pointerEvent('pointermove', { pointerType: 'mouse', clientX: 240, clientY: 150 }))
      vi.advanceTimersToNextFrame()
      expect(isShown(crosshair)).toBe(true)
    })
  })
})

type CircleDatum = { x: number; a: number; b: number; c: number | undefined }
type CrosshairInternals = {
  getCircleData: (datum: CircleDatum, datumIndex: number) => CrosshairCircle[];
  getPaintOrder: (circles: CrosshairCircle[]) => CrosshairCircle[];
}

const datum: CircleDatum = { x: 5, a: 10, b: 20, c: 70 }
const datumIndex = 5
const colors = ['#3b82f6', '#f59e0b', '#10b981']

function getCircles (config: CrosshairConfigInterface<CircleDatum>, colorKeys?: string[]): CrosshairCircle[] {
  const crosshair = new Crosshair<CircleDatum>({
    x: d => d.x,
    yStacked: [d => d.a, d => d.b],
    y: [d => d.c],
    ...config,
  })
  if (colorKeys) crosshair.colorKeys = colorKeys
  return (crosshair as unknown as CrosshairInternals).getCircleData(datum, datumIndex)
}

describe('Crosshair circles with both `yStacked` and `y`', () => {
  it('passes the circle index to `color`, `strokeColor` and `strokeWidth` alike', () => {
    const circles = getCircles({
      color: (d, i) => colors[i],
      strokeColor: (d, i) => colors[i],
      strokeWidth: (d, i) => i + 1,
    })

    expect(circles.map(c => c.color)).toEqual(colors)
    expect(circles.map(c => c.strokeColor)).toEqual(colors)
    expect(circles.map(c => c.strokeWidth)).toEqual([1, 2, 3])
  })

  it('looks up the stroke color key by the circle index', () => {
    const circles = getCircles({
      color: 'none',
      strokeColor: (d, i, key) => key,
    }, ['a', 'b', 'c'])

    expect(circles.map(c => c.strokeColor)).toEqual(['a', 'b', 'c'])
  })

  it('reads the stacked values with the datum index', () => {
    const circles = getCircles({
      yStacked: [(d, i) => i === datumIndex ? d.a : undefined, (d, i) => i === datumIndex ? d.b : undefined],
    })

    expect(circles.map(c => c.opacity)).toEqual([1, 1, 1])
  })
})

describe('Crosshair circles paint order', () => {
  const paintOrder = (d: Pick<CircleDatum, 'a' | 'b' | 'c'>, yMax = 2000): string[] => {
    const crosshair = new Crosshair<CircleDatum>({ x: d => d.x, yStacked: [d => d.a, d => d.b], y: [d => d.c], circleRadius: 5 })
    crosshair.setScaleDomain(ScaleDimension.Y, [0, yMax])
    crosshair.setScaleRange(ScaleDimension.Y, [300, 0])
    const internals = crosshair as unknown as CrosshairInternals
    const circles = internals.getCircleData({ x: 0, ...d }, 0)
    return internals.getPaintOrder(circles).map(c => c.id)
  }

  it('paints a thick segment over a thin one stacked on top of it', () => {
    expect(paintOrder({ a: 1600, b: 3, c: undefined })).toEqual(['stacked-1', 'stacked-0'])
  })

  it('paints the largest of the tiny segments near zero last', () => {
    expect(paintOrder({ a: 0.01, b: 0.03, c: 0.02 })).toEqual(['stacked-0', 'regular-0', 'stacked-1'])
  })

  it('keeps the order when the circles do not overlap', () => {
    expect(paintOrder({ a: 100, b: 700, c: 1500 })).toEqual(['stacked-0', 'stacked-1', 'regular-0'])
  })

  it('does not reorder the circles returned by `getCircleData`', () => {
    const crosshair = new Crosshair<CircleDatum>({ x: d => d.x, yStacked: [d => d.a, d => d.b], y: [d => d.c], circleRadius: 5 })
    crosshair.setScaleDomain(ScaleDimension.Y, [0, 2000])
    crosshair.setScaleRange(ScaleDimension.Y, [300, 0])
    const circles = (crosshair as unknown as CrosshairInternals).getCircleData({ x: 0, a: 1600, b: 3, c: 1599 }, 0)
    expect(circles.map(c => c.id)).toEqual(['stacked-0', 'stacked-1', 'regular-0'])
  })
})
