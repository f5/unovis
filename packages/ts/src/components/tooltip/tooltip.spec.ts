import { afterEach, describe, expect, it, vi } from 'vitest'
import { select } from 'd3-selection'

// Core
import { ComponentCore } from '@/core/component'
import { Tooltip } from '@/components/tooltip'

// Config
import { TooltipConfigInterface } from './config'

const SVG_NS = 'http://www.w3.org/2000/svg'

type TooltipInternals = { _setUpEvents: () => void }
type TooltipSetup = { g: SVGGElement; paths: SVGPathElement[]; background: SVGRectElement; tooltip: Tooltip }

function pointerEvent (type: string, init: PointerEventInit = {}): PointerEvent {
  // `pointerenter` and `pointerleave` don't bubble in browsers
  const bubbles = !['pointerenter', 'pointerleave'].includes(type)
  return new PointerEvent(type, { bubbles, cancelable: true, composed: true, pointerId: 1, isPrimary: true, ...init })
}

/** A fake component with two trigger elements (`A` and `B`) and a background element that isn't a trigger */
function setUpTooltip (config: TooltipConfigInterface = {}): TooltipSetup {
  const container = document.createElement('div')
  const svg = document.createElementNS(SVG_NS, 'svg')
  const g = document.createElementNS(SVG_NS, 'g')
  const background = document.createElementNS(SVG_NS, 'rect')
  g.appendChild(background)
  svg.appendChild(g)
  container.appendChild(svg)
  document.body.appendChild(container)

  select(g).selectAll('path').data(['A', 'B']).enter().append('path').attr('class', 'segment')
  const paths = Array.from(g.querySelectorAll('path'))

  const tooltip = new Tooltip({ triggers: { segment: (d: string) => `Segment ${d}` }, ...config })
  tooltip.setContainer(container)
  tooltip.setComponents([{ element: g } as unknown as ComponentCore<unknown>])
  // Bypass the throttled `update()`
  ;(tooltip as unknown as TooltipInternals)._setUpEvents()

  return { g, paths, background, tooltip }
}

// The `hidden` class is applied on `transitionend`, which jsdom never fires, so we check the `show` class
const isShown = (tooltip: Tooltip): boolean => tooltip.element.classList.contains(Tooltip.selectors.show)

describe('Tooltip pointer events (jsdom)', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  describe('mouse', () => {
    it('shows on pointermove over a trigger and hides on pointerleave', () => {
      const { g, paths, tooltip } = setUpTooltip()

      paths[0].dispatchEvent(pointerEvent('pointermove', { pointerType: 'mouse' }))
      expect(isShown(tooltip)).toBe(true)
      expect(tooltip.element.textContent).toBe('Segment A')

      paths[1].dispatchEvent(pointerEvent('pointermove', { pointerType: 'mouse' }))
      expect(tooltip.element.textContent).toBe('Segment B')

      g.dispatchEvent(pointerEvent('pointerleave', { pointerType: 'mouse' }))
      expect(isShown(tooltip)).toBe(false)
    })

    it('hides on pointermove over an element that is not a trigger', () => {
      const { paths, background, tooltip } = setUpTooltip()

      paths[0].dispatchEvent(pointerEvent('pointermove', { pointerType: 'mouse' }))
      background.dispatchEvent(pointerEvent('pointermove', { pointerType: 'mouse' }))
      expect(isShown(tooltip)).toBe(false)
    })

    it('ignores pointerdown and pointerup', () => {
      const { paths, tooltip } = setUpTooltip()

      paths[0].dispatchEvent(pointerEvent('pointerdown', { pointerType: 'mouse' }))
      expect(isShown(tooltip)).toBe(false)

      paths[0].dispatchEvent(pointerEvent('pointermove', { pointerType: 'mouse' }))
      paths[0].dispatchEvent(pointerEvent('pointerup', { pointerType: 'mouse' }))
      expect(isShown(tooltip)).toBe(true)
    })

    it('treats events without a pointer type (e.g. a synthetic `Event`) as mouse events', () => {
      const { g, paths, tooltip } = setUpTooltip()

      paths[0].dispatchEvent(new Event('pointermove', { bubbles: true }))
      expect(isShown(tooltip)).toBe(true)

      // That's how Timeline hides the tooltip on scroll
      g.dispatchEvent(new Event('pointermove'))
      expect(isShown(tooltip)).toBe(false)
    })

    it('is not triggered by mouse events anymore', () => {
      const { paths, tooltip } = setUpTooltip()

      paths[0].dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
      expect(isShown(tooltip)).toBe(false)
    })
  })

  describe('touch', () => {
    /** Emulates the implicit pointer capture that browsers set on the element where a touch starts (jsdom doesn't support it) */
    function mockPointerCapture (el: Element): { releasePointerCapture: ReturnType<typeof vi.fn> } {
      let captured = true
      const releasePointerCapture = vi.fn(() => { captured = false })
      Object.assign(el, { hasPointerCapture: () => captured, releasePointerCapture })
      return { releasePointerCapture }
    }

    it('shows on pointerdown and hides on pointerup', () => {
      const { paths, tooltip } = setUpTooltip()

      paths[0].dispatchEvent(pointerEvent('pointerdown', { pointerType: 'touch' }))
      expect(isShown(tooltip)).toBe(true)
      expect(tooltip.element.textContent).toBe('Segment A')

      paths[0].dispatchEvent(pointerEvent('pointerup', { pointerType: 'touch' }))
      expect(isShown(tooltip)).toBe(false)
    })

    it('releases the implicit pointer capture before the target\'s own listeners, so the next moves target the element under the finger', () => {
      const { paths, tooltip } = setUpTooltip()
      const { releasePointerCapture } = mockPointerCapture(paths[0])
      let isCapturedInTargetListener: boolean | undefined
      paths[0].addEventListener('pointerdown', (e: PointerEvent) => { isCapturedInTargetListener = paths[0].hasPointerCapture(e.pointerId) })

      paths[0].dispatchEvent(pointerEvent('pointerdown', { pointerType: 'touch' }))
      expect(releasePointerCapture).toHaveBeenCalledWith(1)
      expect(isCapturedInTargetListener).toBe(false)

      paths[1].dispatchEvent(pointerEvent('pointermove', { pointerType: 'touch' }))
      expect(tooltip.element.textContent).toBe('Segment B')
    })

    it('releases the pointer capture of a touch that starts outside of the component, e.g. on an axis', () => {
      const { g, paths, tooltip } = setUpTooltip()
      const axis = document.createElementNS(SVG_NS, 'rect')
      g.ownerSVGElement.appendChild(axis)
      const { releasePointerCapture } = mockPointerCapture(axis)

      axis.dispatchEvent(pointerEvent('pointerdown', { pointerType: 'touch' }))
      expect(releasePointerCapture).toHaveBeenCalledWith(1)
      expect(isShown(tooltip)).toBe(false)

      paths[0].dispatchEvent(pointerEvent('pointermove', { pointerType: 'touch' }))
      expect(isShown(tooltip)).toBe(true)
    })

    it('doesn\'t release the pointer capture of a mouse or a pen', () => {
      const { paths } = setUpTooltip()
      const { releasePointerCapture } = mockPointerCapture(paths[0])

      paths[0].dispatchEvent(pointerEvent('pointerdown', { pointerType: 'mouse' }))
      paths[0].dispatchEvent(pointerEvent('pointerdown', { pointerType: 'pen' }))
      expect(releasePointerCapture).not.toHaveBeenCalled()
    })

    it('hides when the finger moves off the triggers or the component', () => {
      const { g, paths, background, tooltip } = setUpTooltip()

      paths[0].dispatchEvent(pointerEvent('pointerdown', { pointerType: 'touch' }))
      background.dispatchEvent(pointerEvent('pointermove', { pointerType: 'touch' }))
      expect(isShown(tooltip)).toBe(false)

      paths[1].dispatchEvent(pointerEvent('pointermove', { pointerType: 'touch' }))
      g.dispatchEvent(pointerEvent('pointerleave', { pointerType: 'touch' }))
      expect(isShown(tooltip)).toBe(false)
    })

    it('hides on pointercancel after `hideDelay`', () => {
      vi.useFakeTimers()
      const { paths, tooltip } = setUpTooltip({ hideDelay: 100 })

      paths[0].dispatchEvent(pointerEvent('pointerdown', { pointerType: 'touch' }))
      paths[0].dispatchEvent(pointerEvent('pointercancel', { pointerType: 'touch' }))
      expect(isShown(tooltip)).toBe(true)

      vi.advanceTimersByTime(100)
      expect(isShown(tooltip)).toBe(false)
    })

    it('ignores all the fingers except the first one', () => {
      const { g, paths, tooltip } = setUpTooltip()

      paths[0].dispatchEvent(pointerEvent('pointerdown', { pointerType: 'touch' }))
      paths[1].dispatchEvent(pointerEvent('pointerdown', { pointerType: 'touch', pointerId: 2, isPrimary: false }))
      paths[1].dispatchEvent(pointerEvent('pointermove', { pointerType: 'touch', pointerId: 2, isPrimary: false }))
      expect(tooltip.element.textContent).toBe('Segment A')

      // Browsers fire `pointerleave` after `pointerup` of a touch
      paths[1].dispatchEvent(pointerEvent('pointerup', { pointerType: 'touch', pointerId: 2, isPrimary: false }))
      g.dispatchEvent(pointerEvent('pointerleave', { pointerType: 'touch', pointerId: 2, isPrimary: false }))
      expect(isShown(tooltip)).toBe(true)
    })

    it('keeps the tooltip of a touch that started while the previous one was being hidden after `hideDelay`', () => {
      vi.useFakeTimers()
      const { g, paths, tooltip } = setUpTooltip({ hideDelay: 300 })

      paths[0].dispatchEvent(pointerEvent('pointerdown', { pointerType: 'touch' }))
      paths[0].dispatchEvent(pointerEvent('pointerup', { pointerType: 'touch' }))
      g.dispatchEvent(pointerEvent('pointerleave', { pointerType: 'touch' }))
      vi.advanceTimersByTime(100)

      paths[1].dispatchEvent(pointerEvent('pointerdown', { pointerType: 'touch', pointerId: 2 }))
      vi.advanceTimersByTime(400)
      expect(isShown(tooltip)).toBe(true)
      expect(tooltip.element.textContent).toBe('Segment B')
    })

    it('doesn\'t prevent the default action (scrolling, clicks)', () => {
      const { paths } = setUpTooltip()

      const pointerDown = pointerEvent('pointerdown', { pointerType: 'touch' })
      paths[0].dispatchEvent(pointerDown)
      expect(pointerDown.defaultPrevented).toBe(false)
    })
  })

  describe('pen', () => {
    it('shows on pointerdown since a pen can\'t always hover, but keeps showing after pointerup like a mouse', () => {
      const { g, paths, tooltip } = setUpTooltip()

      paths[0].dispatchEvent(pointerEvent('pointerdown', { pointerType: 'pen' }))
      expect(isShown(tooltip)).toBe(true)

      paths[0].dispatchEvent(pointerEvent('pointerup', { pointerType: 'pen' }))
      expect(isShown(tooltip)).toBe(true)

      g.dispatchEvent(pointerEvent('pointerleave', { pointerType: 'pen' }))
      expect(isShown(tooltip)).toBe(false)
    })

    it('hides on pointercancel, after which Safari fires `pointerleave` on the target element only', () => {
      const { paths, tooltip } = setUpTooltip()

      paths[0].dispatchEvent(pointerEvent('pointermove', { pointerType: 'pen' }))
      paths[0].dispatchEvent(pointerEvent('pointercancel', { pointerType: 'pen' }))
      paths[0].dispatchEvent(pointerEvent('pointerleave', { pointerType: 'pen' }))
      expect(isShown(tooltip)).toBe(false)
    })
  })

  describe('trigger events', () => {
    it('stops the propagation of the events that have reached a trigger', () => {
      const { g, paths, background } = setUpTooltip()
      const ancestorListener = vi.fn()
      g.ownerSVGElement.addEventListener('pointermove', ancestorListener)

      paths[0].dispatchEvent(pointerEvent('pointermove', { pointerType: 'mouse' }))
      expect(ancestorListener).not.toHaveBeenCalled()

      background.dispatchEvent(pointerEvent('pointermove', { pointerType: 'mouse' }))
      expect(ancestorListener).toHaveBeenCalledTimes(1)
    })
  })

  describe('allowHover', () => {
    it('keeps the tooltip displayed while the pointer is over it', () => {
      vi.useFakeTimers()
      const { g, paths, tooltip } = setUpTooltip({ allowHover: true, hideDelay: 50 })

      paths[0].dispatchEvent(pointerEvent('pointermove', { pointerType: 'mouse' }))
      g.dispatchEvent(pointerEvent('pointerleave', { pointerType: 'mouse' }))
      tooltip.element.dispatchEvent(pointerEvent('pointerenter', { pointerType: 'mouse' }))
      vi.advanceTimersByTime(50)
      expect(isShown(tooltip)).toBe(true)

      tooltip.element.dispatchEvent(pointerEvent('pointerleave', { pointerType: 'mouse' }))
      vi.advanceTimersByTime(50)
      expect(isShown(tooltip)).toBe(false)
    })
  })
})
