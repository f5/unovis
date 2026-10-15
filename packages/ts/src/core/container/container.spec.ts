import { afterEach, describe, expect, it, vi } from 'vitest'
import { XYContainer } from '@/containers/xy-container'
import { Line } from '@/components/line'

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
