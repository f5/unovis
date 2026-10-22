import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Sankey } from '@/components/sankey'
import { Sizing } from '@/types/component'
import { SingleContainer } from './index'

type Node = { id: string }
type Link = { source: string; target: string; value: number }

const getData = (): { nodes: Node[]; links: Link[] } => ({
  nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
  links: [{ source: 'A', target: 'B', value: 5 }, { source: 'A', target: 'C', value: 3 }],
})

const getChainData = (): { nodes: Node[]; links: Link[] } => ({
  nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }],
  links: [{ source: 'A', target: 'B', value: 5 }, { source: 'B', target: 'C', value: 5 }, { source: 'C', target: 'D', value: 5 }],
})

// A fixed label width keeps the bleed independent of the container size, which is always 0 in jsdom
const createSankey = (): Sankey<Node, Link> => new Sankey<Node, Link>({ duration: 0, labelMaxWidth: 50 })

describe('SingleContainer sizing', () => {
  let element: HTMLDivElement
  let frames: Map<number, FrameRequestCallback>

  // Runs the queued animation frames, i.e. the container and component renders
  const flushFrames = (): void => {
    const callbacks = [...frames.values()]
    frames.clear()
    callbacks.forEach(cb => cb(performance.now()))
  }

  beforeEach(() => {
    frames = new Map()
    let frameId = 0
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback): number => { frames.set(++frameId, cb); return frameId })
    vi.stubGlobal('cancelAnimationFrame', (id: number): void => { frames.delete(id) })
    // jsdom doesn't implement SVG text measurement
    Object.assign(SVGElement.prototype, { getComputedTextLength: (): number => 0 })
    element = document.createElement('div')
    document.body.appendChild(element)
  })

  afterEach(() => {
    element.remove()
    vi.unstubAllGlobals()
  })

  const getSvgSize = (container: SingleContainer<unknown>): [number, number] => [+container.svg.attr('width'), +container.svg.attr('height')]

  const getExtendedSize = (setUp: (sankey: Sankey<Node, Link>) => SingleContainer<unknown>): [number, number] => {
    const sankey = createSankey()
    const container = setUp(sankey)
    const size = getSvgSize(container)
    container.destroy()
    return size
  }

  it('sizes the SVG to the component when the sizing is set after the data', () => {
    const expected = getExtendedSize(sankey => new SingleContainer(element, { component: sankey, sizing: Sizing.Extend }, getData()))
    expect(expected[0]).toBeGreaterThan(0)

    // Sizing set by a later `updateContainer` call (e.g. the Vue and Solid wrappers or a runtime switch)
    expect(getExtendedSize(sankey => {
      const container = new SingleContainer(element, { component: sankey }, getData())
      container.updateContainer({ component: sankey, sizing: Sizing.Extend })
      return container
    })).toEqual(expected)

    // Data set on the component before it's passed to the container
    expect(getExtendedSize(sankey => {
      sankey.setData(getData())
      return new SingleContainer(element, { component: sankey, sizing: Sizing.Extend })
    })).toEqual(expected)
  })

  it('doesn\'t throw when the sizing is set without a component', () => {
    const container = new SingleContainer(element, { component: createSankey(), sizing: Sizing.Extend }, getData())
    expect(() => container.updateContainer({ component: undefined, sizing: Sizing.Extend })).not.toThrow()
    container.destroy()
  })

  it('sizes the SVG to the current data after the previous layout was bigger', () => {
    const expected = getExtendedSize(sankey => new SingleContainer(element, { component: sankey, sizing: Sizing.Extend }, getData()))

    // The data shrinks
    expect(getExtendedSize(sankey => {
      const container = new SingleContainer(element, { component: sankey, sizing: Sizing.Extend }, getChainData())
      flushFrames()
      container.setData(getData())
      return container
    })).toEqual(expected)

    // The data grows while the sizing is `Sizing.Fit`
    const expectedChain = getExtendedSize(sankey => new SingleContainer(element, { component: sankey, sizing: Sizing.Extend }, getChainData()))
    expect(getExtendedSize(sankey => {
      const container = new SingleContainer(element, { component: sankey, sizing: Sizing.Extend }, getData())
      flushFrames()
      container.updateContainer({ component: sankey, sizing: Sizing.Fit })
      flushFrames()
      container.setData(getChainData())
      flushFrames()
      container.updateContainer({ component: sankey, sizing: Sizing.Extend })
      return container
    })).toEqual(expectedChain)

    // The sizing switches to `Sizing.FitWidth`, which doesn't grow the component to its layout
    const sankey = createSankey()
    const container = new SingleContainer(element, { component: sankey, sizing: Sizing.Extend }, getChainData())
    flushFrames()
    container.updateContainer({ component: sankey, sizing: Sizing.FitWidth }, true)
    container.setData(getData())
    expect(+container.svg.attr('viewBox').split(' ')[2]).toEqual(expected[0])
    container.destroy()
  })

  it('keeps the zoomed size when the sizing switches back to `Sizing.Extend`', () => {
    const sankey = createSankey()
    const container = new SingleContainer(element, { component: sankey, sizing: Sizing.Extend }, getData())
    flushFrames()
    const [width] = getSvgSize(container)

    sankey.setZoomScale(2, 1, 0)
    container.render()
    const zoomedSize = getSvgSize(container)
    expect(zoomedSize[0]).toBeGreaterThan(width)

    flushFrames()
    container.updateContainer({ component: sankey, sizing: Sizing.Fit })
    flushFrames()
    container.updateContainer({ component: sankey, sizing: Sizing.Extend })
    expect(getSvgSize(container)).toEqual(zoomedSize)
    container.destroy()
  })
})
