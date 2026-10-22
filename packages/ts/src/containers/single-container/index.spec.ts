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

describe('SingleContainer sizing', () => {
  let element: HTMLDivElement

  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', vi.fn())
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    // jsdom doesn't implement SVG text measurement
    Object.assign(SVGElement.prototype, { getComputedTextLength: (): number => 0 })
    element = document.createElement('div')
    document.body.appendChild(element)
  })

  afterEach(() => {
    element.remove()
    vi.unstubAllGlobals()
  })

  const getExtendedSize = (setUp: (sankey: Sankey<Node, Link>) => SingleContainer<unknown>): [number, number] => {
    const sankey = new Sankey<Node, Link>({ duration: 0 })
    const container = setUp(sankey)
    const size: [number, number] = [+container.svg.attr('width'), +container.svg.attr('height')]
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
    const container = new SingleContainer(element, { component: new Sankey<Node, Link>(), sizing: Sizing.Extend }, getData())
    expect(() => container.updateContainer({ component: undefined, sizing: Sizing.Extend })).not.toThrow()
    container.destroy()
  })
})
