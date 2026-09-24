import { afterEach, describe, expect, it } from 'vitest'
import { select } from 'd3-selection'
import 'd3-transition'

// Core
import { ContainerCore } from '@/core/container'

function createContainer (): ContainerCore {
  const element = document.createElement('div')
  document.body.appendChild(element)

  const container = new ContainerCore(element)
  container.updateContainer({})
  return container
}

/** d3 stores a node's scheduled transitions on `__transition` and drops it once they're all gone */
function isTransitioning (node: Element): boolean {
  return (node as unknown as Record<string, unknown>).__transition !== undefined
}

/** Starts a transition and checks it really got scheduled, so the assertions can't pass vacuously */
function startTransition (node: Element): void {
  select(node).transition().duration(600).attr('opacity', 0)
  expect(isTransitioning(node)).toBe(true)
}

describe('ContainerCore teardown (jsdom)', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('interrupts a transition running on a child element', () => {
    const container = createContainer()
    const child = container.svg.append('rect').node()
    startTransition(child)

    container.destroy()

    expect(isTransitioning(child)).toBe(false)
  })

  it('interrupts a transition running on a nested descendant', () => {
    const container = createContainer()
    const nested = container.svg.append('g').append('path').node()
    startTransition(nested)

    container.destroy()

    expect(isTransitioning(nested)).toBe(false)
  })

  it('interrupts a transition running on the container SVG itself', () => {
    const container = createContainer()
    const svgNode = container.svg.node()
    startTransition(svgNode)

    container.destroy()

    expect(isTransitioning(svgNode)).toBe(false)
  })
})
