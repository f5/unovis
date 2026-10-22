import { describe, expect, it } from 'vitest'

// Containers
import { SingleContainer } from '@/containers/single-container'

// Component
import { NestedDonut } from './index'

type Datum = { group: string; item: string; value: number }

const data: Datum[] = [
  { group: 'a', item: 'x', value: 1 },
  { group: 'a', item: 'y', value: 2 },
  { group: 'b', item: 'z', value: 3 },
]

const nextFrame = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => resolve()))

describe('NestedDonut', () => {
  it('reuses segment elements when it renders again', async () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    const component = new NestedDonut<Datum>({
      layers: [d => d.group, d => d.item],
      value: d => d.value,
      showSegmentLabels: false,
      duration: 0,
    })
    const container = new SingleContainer<Datum>(element, { component }, data)
    await nextFrame()

    for (const value of [2, 3]) {
      container.setData(data.map(d => ({ ...d, value: d.value * value })))
      await nextFrame()
    }

    expect(element.querySelectorAll(`.${NestedDonut.selectors.segment}`)).toHaveLength(5)
    expect(element.querySelectorAll(`.${NestedDonut.selectors.segmentArc}`)).toHaveLength(5)
    container.destroy()
    element.remove()
  })

  it('removes the segments of removed data', async () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    const component = new NestedDonut<Datum>({
      layers: [d => d.group, d => d.item],
      value: d => d.value,
      showSegmentLabels: false,
      duration: 0,
    })
    const container = new SingleContainer<Datum>(element, { component }, data)
    await nextFrame()

    container.setData(data.filter(d => d.group === 'a'))
    await nextFrame()

    expect(element.querySelectorAll(`.${NestedDonut.selectors.segment}`)).toHaveLength(3)
    expect(element.querySelectorAll(`.${NestedDonut.selectors.segmentArc}`)).toHaveLength(3)
    container.destroy()
    element.remove()
  })

  it('shrinks the layers when they do not fit into the available radius', async () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    const component = new NestedDonut<Datum>({
      layers: [d => d.group, d => d.item],
      layerSettings: { width: 100 },
      value: d => d.value,
      showSegmentLabels: false,
      duration: 0,
    })
    const container = new SingleContainer<Datum>(element, { component, width: 200, height: 200 }, data)
    await nextFrame()

    expect(element.querySelector(`.${NestedDonut.selectors.centralBackground}`).getAttribute('r')).toBe('0')
    container.destroy()
    element.remove()
  })

  it('resolves percentage layer widths against the radius', async () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    const component = new NestedDonut<Datum>({
      layers: [d => d.group, d => d.item],
      layerSettings: { width: '25%' },
      value: d => d.value,
      showSegmentLabels: false,
      duration: 0,
    })
    const container = new SingleContainer<Datum>(element, { component, width: 200, height: 200 }, data)
    await nextFrame()

    expect(element.querySelector(`.${NestedDonut.selectors.centralBackground}`).getAttribute('r')).toBe('50')
    container.destroy()
    element.remove()
  })
})
