import { afterEach, describe, expect, it, vi } from 'vitest'

// Core
import { ContainerCore } from '@/core/container'
import { XYContainer } from '@/containers/xy-container'
import { SingleContainer } from '@/containers/single-container'
import { Line } from '@/components/line'
import { Tooltip } from '@/components/tooltip'
import { Donut } from '@/components/donut'
import { Scatter } from '@/components/scatter'

type Datum = { x: number; y: number }
const data: Datum[] = [{ x: 0, y: 1 }, { x: 1, y: 2 }]
const nextFrame = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => resolve()))

describe('container resize observer (jsdom)', () => {
  let element: HTMLDivElement

  afterEach(() => {
    vi.unstubAllGlobals()
    element?.remove()
  })

  const renderLine = (): XYContainer<Datum> => {
    element = document.createElement('div')
    document.body.appendChild(element)
    const line = new Line<Datum>({ x: d => d.x, y: d => d.y })
    return new XYContainer(element, { components: [line] }, data)
  }

  it('renders and destroys without ResizeObserver', async () => {
    vi.stubGlobal('ResizeObserver', undefined)
    const container = renderLine()
    await nextFrame()

    expect(element.querySelector('path')).not.toBeNull()
    expect(() => container.destroy()).not.toThrow()
  })

  it('observes the container and disconnects on destroy', () => {
    const observe = vi.fn()
    const disconnect = vi.fn()
    vi.stubGlobal('ResizeObserver', class {
      observe = observe
      disconnect = disconnect
    })
    const container = renderLine()
    container.destroy()

    expect(observe).toHaveBeenCalledWith(element)
    expect(disconnect).toHaveBeenCalledTimes(1)
  })
})

describe('Container (jsdom)', () => {
  describe('touch-action', () => {
    function renderAndGetTouchAction (container: ContainerCore): string {
      container.render(0)
      vi.advanceTimersToNextFrame()
      return (container.svg.node() as SVGSVGElement).style.touchAction
    }

    it('lets a touch drag move the Tooltip when it has triggers, unless `followTouchMove` is `false`', () => {
      vi.useFakeTimers()
      const element = document.createElement('div')
      document.body.appendChild(element)
      const tooltip = new Tooltip({ triggers: { [Scatter.selectors.point]: () => 'Point' } })
      const container = new XYContainer<number>(element, { components: [], tooltip }, [1, 2])
      expect(renderAndGetTouchAction(container)).toBe('pinch-zoom')

      tooltip.setConfig({ ...tooltip.config, followTouchMove: false })
      expect(renderAndGetTouchAction(container)).toBe('')

      // A Tooltip without triggers (e.g. the one that only displays the Crosshair's content) doesn't follow touches itself
      container.updateContainer({ components: [], tooltip: new Tooltip() })
      expect(renderAndGetTouchAction(container)).toBe('')

      container.destroy()
      vi.useRealTimers()
    })

    it('does the same in Single Container', () => {
      vi.useFakeTimers()
      const element = document.createElement('div')
      document.body.appendChild(element)
      const tooltip = new Tooltip({ triggers: { [Donut.selectors.segment]: () => 'Segment' } })
      const container = new SingleContainer<number[]>(element, { component: new Donut<number>({ value: d => d }), tooltip }, [1, 2])
      expect(renderAndGetTouchAction(container)).toBe('pinch-zoom')

      container.updateContainer({ component: container.config.component, tooltip: undefined })
      expect(renderAndGetTouchAction(container)).toBe('')

      container.destroy()
      vi.useRealTimers()
    })
  })
})
