import { describe, expect, it, vi } from 'vitest'

// Core
import { ContainerCore } from '@/core/container'
import { XYContainer } from '@/containers/xy-container'
import { SingleContainer } from '@/containers/single-container'
import { Tooltip } from '@/components/tooltip'
import { Donut } from '@/components/donut'
import { Scatter } from '@/components/scatter'

// Styles
import * as s from './style'

describe('Container styles (jsdom)', () => {
  it('prevents text selection on touch screens, keeping the XY container\'s own class', () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    const container = new XYContainer(element, { components: [] })
    const svg = container.svg.node() as SVGSVGElement

    expect(svg.classList).toContain(s.root)
    expect(svg.classList.length).toBe(2)

    const css = [...document.querySelectorAll('style')].map(style => style.textContent).join('').replace(/\s/g, '')
    const touchRule = css.match(new RegExp(`@media\\(hover:none\\)and\\(pointer:coarse\\){\\.${s.root}{([^}]*)}}`))?.[1]
    expect(touchRule).toContain('-webkit-user-select:none')
    expect(touchRule).toContain('-webkit-touch-callout:none')
    container.destroy()
  })

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
