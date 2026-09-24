import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Core
import { ContainerCore } from '@/core/container'

// Config
import { ContainerConfigInterface } from '@/core/container/config'

class TestContainer extends ContainerCore {
  public triggerResize (): void {
    this._onResize()
  }
}

function createContainer (config: ContainerConfigInterface = {}): { container: TestContainer; render: ReturnType<typeof vi.fn> } {
  const element = document.createElement('div')
  document.body.appendChild(element)

  const container = new TestContainer(element)
  container.updateContainer(config)

  const render = vi.fn()
  container.render = render
  return { container, render }
}

/** The first resize after mount is applied immediately, so consume it before the assertions */
function createResizedContainer (config: ContainerConfigInterface = {}): ReturnType<typeof createContainer> {
  const { container, render } = createContainer(config)
  container.triggerResize()
  render.mockClear()
  return { container, render }
}

describe('ContainerCore resize (jsdom)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('renders immediately on the first resize after mount', () => {
    const { container, render } = createContainer()

    container.triggerResize()

    expect(render).toHaveBeenCalledTimes(1)
  })

  describe('when the size keeps changing', () => {
    it('renders once the size has settled', () => {
      const { container, render } = createResizedContainer({ resizeDebounce: 250 })

      container.triggerResize()
      container.triggerResize()
      container.triggerResize()
      vi.advanceTimersByTime(250)

      expect(render).toHaveBeenCalledTimes(1)
    })

    it('does not render before the delay has elapsed', () => {
      const { container, render } = createResizedContainer({ resizeDebounce: 250 })

      container.triggerResize()
      vi.advanceTimersByTime(249)

      expect(render).not.toHaveBeenCalled()
    })
  })

  describe('when `resizeDebounce` is `0`', () => {
    it('renders on every resize', () => {
      const { container, render } = createResizedContainer({ resizeDebounce: 0 })

      container.triggerResize()
      container.triggerResize()

      expect(render).toHaveBeenCalledTimes(2)
    })
  })

  describe('when `redrawOnResize` is `false`', () => {
    it('never renders', () => {
      const { container, render } = createContainer({ redrawOnResize: false })

      container.triggerResize()
      vi.advanceTimersByTime(1000)

      expect(render).not.toHaveBeenCalled()
    })

    it('still resizes the SVG element so the chart keeps fitting its parent', () => {
      const { container } = createContainer({ redrawOnResize: false, width: 640 })

      container.triggerResize()

      expect(container.svg.attr('width')).toBe('640')
    })
  })

  it('renders when the options come through as `undefined`, as framework wrappers pass them', () => {
    const { container, render } = createContainer({ redrawOnResize: undefined, resizeDebounce: undefined })

    container.triggerResize()

    expect(render).toHaveBeenCalledTimes(1)
  })

  it('debounces when `resizeDebounce` comes through as `undefined`', () => {
    const { container, render } = createResizedContainer({ resizeDebounce: undefined })

    container.triggerResize()

    expect(render).not.toHaveBeenCalled()
  })

  it('resizes the SVG element while the redraw is still debounced', () => {
    const { container } = createResizedContainer({ width: 640 })

    container.triggerResize()

    expect(container.svg.attr('width')).toBe('640')
  })

  it('cancels a pending debounced render when destroyed', () => {
    const { container, render } = createResizedContainer()

    container.triggerResize()
    container.destroy()
    vi.advanceTimersByTime(1000)

    expect(render).not.toHaveBeenCalled()
  })
})
