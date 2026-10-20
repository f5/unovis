import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Crosshair } from '@/components/crosshair'
import { Tooltip } from '@/components/tooltip'
import { XYContainer } from './index'

describe('XYContainer crosshair tooltip', () => {
  let element: HTMLDivElement
  let container: XYContainer<number>

  beforeEach(() => {
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    element = document.createElement('div')
    document.body.appendChild(element)
    container = new XYContainer<number>(element)
  })

  afterEach(() => {
    container.destroy()
    element.remove()
    vi.unstubAllGlobals()
  })

  it('creates and reuses a tooltip for a custom crosshair template', () => {
    const crosshair = new Crosshair<number>({ template: d => `${d}` })
    const createTooltip = vi.spyOn(crosshair, 'createTooltip')
    container.updateContainer({ crosshair }, true)
    const tooltip = container.config.tooltip

    expect(tooltip).toBeInstanceOf(Tooltip)
    expect(crosshair.tooltip).toBe(tooltip)
    expect(tooltip.getContainer()).toBe(element)
    expect(tooltip.element.isConnected).toBe(true)

    container.updateContainer({ crosshair }, true)
    expect(container.config.tooltip).toBe(tooltip)

    container.updateContainer({ ...container.config }, true)
    expect(container.config.tooltip).toBe(tooltip)
    expect(tooltip.element.isConnected).toBe(true)
    expect(createTooltip).toHaveBeenCalledOnce()

    container.destroy()
    expect(tooltip.element.isConnected).toBe(false)
  })

  it('does not create a tooltip without a custom template', () => {
    const crosshair = new Crosshair<number>()
    container.updateContainer({ crosshair }, true)

    expect(container.config.tooltip).toBeUndefined()
    expect(crosshair.tooltip).toBeUndefined()
    expect(element.children).toHaveLength(1)
  })

  it('uses an explicitly supplied container tooltip', () => {
    const tooltip = new Tooltip()
    const crosshair = new Crosshair<number>({ template: d => `${d}` })
    container.updateContainer({ crosshair, tooltip }, true)

    expect(container.config.tooltip).toBe(tooltip)
    expect(crosshair.tooltip).toBe(tooltip)
    expect(element.children).toHaveLength(2)
  })

  it('does not create a fallback when the crosshair has its own tooltip', () => {
    const tooltip = new Tooltip({ container: element })
    const crosshair = new Crosshair<number>({ template: d => `${d}`, tooltip })
    container.updateContainer({ crosshair }, true)

    expect(container.config.tooltip).toBeUndefined()
    expect(crosshair.config.tooltip).toBe(tooltip)
    expect(element.children).toHaveLength(2)
    tooltip.destroy()
  })

  it('destroys the fallback when an explicit tooltip replaces it', () => {
    const crosshair = new Crosshair<number>({ template: d => `${d}` })
    container.updateContainer({ crosshair }, true)
    const fallback = container.config.tooltip
    const destroy = vi.spyOn(fallback, 'destroy')
    const tooltip = new Tooltip()

    container.updateContainer({ crosshair, tooltip }, true)

    expect(destroy).toHaveBeenCalledOnce()
    expect(fallback.element.isConnected).toBe(false)
    expect(crosshair.tooltip).toBe(tooltip)
    expect(element.children).toHaveLength(2)
  })

  it('removes the fallback when the custom template is removed', () => {
    const crosshair = new Crosshair<number>({ template: d => `${d}` })
    container.updateContainer({ crosshair }, true)
    const tooltip = container.config.tooltip

    crosshair.setConfig({})
    container.updateContainer({ crosshair }, true)

    expect(container.config.tooltip).toBeUndefined()
    expect(crosshair.tooltip).toBeUndefined()
    expect(tooltip.element.isConnected).toBe(false)
  })

  it('removes the fallback when the crosshair is removed', () => {
    const crosshair = new Crosshair<number>({ template: d => `${d}` })
    container.updateContainer({ crosshair }, true)
    const tooltip = container.config.tooltip

    container.updateContainer({}, true)

    expect(container.config.tooltip).toBeUndefined()
    expect(tooltip.element.isConnected).toBe(false)
    crosshair.destroy()
  })
})
