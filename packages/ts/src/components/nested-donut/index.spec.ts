import { describe, expect, it, vi } from 'vitest'

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
const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

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

  it('keeps the background arcs valid while animating the angle range', async () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    const component = new NestedDonut<Datum>({
      layers: [d => d.group, d => d.item],
      value: d => d.value,
      showSegmentLabels: false,
      duration: 100,
    })
    const container = new SingleContainer<Datum>(element, { component, width: 200, height: 200 }, data)
    await wait(150)

    const setAttribute = vi.spyOn(Element.prototype, 'setAttribute')
    component.setConfig({ ...component.config, angleRange: [-Math.PI / 2, Math.PI / 2] })
    component.render()
    await wait(150)

    const backgroundPaths = setAttribute.mock.calls
      .filter(([name], i) => name === 'd' && (setAttribute.mock.contexts[i] as Element).classList.contains(NestedDonut.selectors.background))
      .map(([, path]) => path)
    setAttribute.mockRestore()

    expect(backgroundPaths.length).toBeGreaterThan(2)
    const arcFlags = backgroundPaths.flatMap(path => [...path.matchAll(/A([^MLAZ]+)/g)]
      .flatMap(([, params]) => params.split(',').filter((p, i) => i % 7 === 3 || i % 7 === 4)))
    expect(arcFlags.length).toBeGreaterThan(0)
    expect(arcFlags.every(flag => flag === '0' || flag === '1')).toBe(true)
    container.destroy()
    element.remove()
  })
})
