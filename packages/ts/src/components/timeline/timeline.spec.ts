import { describe, expect, it, vi } from 'vitest'

// Core
import { Timeline } from '@/components/timeline'

type TimelineInternals = { _maxScroll: number; _scrollDistance: number }

/** jsdom has no `Touch`, so we attach the touch list to a plain cancelable event */
function touchEvent (type: string, clientY: number): Event {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'touches', { value: [{ clientY }] })
  return event
}

describe('Timeline touch scrolling (jsdom)', () => {
  it('scrolls with a touch drag and lets the page scroll when the timeline reaches its edge', () => {
    const onScroll = vi.fn()
    const timeline = new Timeline({ onScroll })
    const internals = timeline as unknown as TimelineInternals
    internals._maxScroll = 100

    timeline.element.dispatchEvent(touchEvent('touchstart', 200))
    const move = touchEvent('touchmove', 140)
    timeline.element.dispatchEvent(move)
    expect(internals._scrollDistance).toBe(60)
    expect(move.defaultPrevented).toBe(true)
    expect(onScroll).toHaveBeenLastCalledWith(60)

    timeline.element.dispatchEvent(touchEvent('touchmove', 40))
    expect(internals._scrollDistance).toBe(100)

    // The timeline can't scroll further, so the browser can scroll the page
    const edgeMove = touchEvent('touchmove', 0)
    timeline.element.dispatchEvent(edgeMove)
    expect(internals._scrollDistance).toBe(100)
    expect(edgeMove.defaultPrevented).toBe(false)
  })

  it('doesn\'t prevent the default action when there is nothing to scroll', () => {
    const timeline = new Timeline({})

    const start = touchEvent('touchstart', 200)
    timeline.element.dispatchEvent(start)
    const move = touchEvent('touchmove', 100)
    timeline.element.dispatchEvent(move)
    expect(start.defaultPrevented).toBe(false)
    expect(move.defaultPrevented).toBe(false)
  })
})
