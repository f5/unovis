// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection, mouse } from 'd3-selection'

// Core
// import { ContainerCore } from 'core/container'
import { ComponentCore } from 'core/component'

// Utils
import { throttle } from 'utils/data'

// Config
import { TooltipConfig, TooltipConfigInterface } from './config'

// Style
import * as s from './style'

export class Tooltip<T extends ComponentCore<any>, TooltipDatum> {
  element: HTMLElement
  div: Selection<HTMLElement, any, any, any>
  config: TooltipConfig<T, TooltipDatum>
  prevConfig: TooltipConfig<T, TooltipDatum>
  components: T[]
  _setUpEventsThrottled = throttle(this._setUpEvents, 1000)

  private _container: HTMLElement

  constructor (config?: TooltipConfigInterface<T, TooltipDatum>, containerElement?: HTMLElement) {
    this.config = new TooltipConfig<T, TooltipDatum>().init(config)
    this.components = this.config.components

    this.element = document.createElement('div')
    this.div = select(this.element)
      .attr('class', s.tooltip)

    this.setContainer(containerElement)
  }

  setContainer (container: HTMLElement): void {
    if (!container) return
    this._container?.removeChild(this.element)

    this._container = container
    this._container.appendChild(this.element)

    // Tooltip position calculation relies on the parent position
    // If it's not set, we set it to `relative` (not a good practice tbh)
    if (!this._container.style.position) {
      this._container.style.position = 'relative'
    }
  }

  setComponents (components: T[]): void {
    this.components = components
  }

  update (): void {
    if (!this._container) return

    this._setUpEventsThrottled()
  }

  show (html: string, pos: { x: number; y: number}): void {
    this.div.classed('show', true)
      .html(html)

    this.place(pos)
  }

  hide (): void {
    this.div.classed('show', false)
  }

  place (pos): void {
    const width = this.element.offsetWidth
    // const height = this.element.offsetHeight
    const containerHeight = this._container.offsetHeight

    this.div
      .style('bottom', `${containerHeight - pos.y}px`)
      .style('left', `${pos.x - width / 2}px`)
  }

  _setUpEvents (): void {
    const { config: { triggers } } = this

    Object.keys(triggers).forEach(className => {
      const template = triggers[className]
      this.components.forEach(component => {
        component.g.selectAll(`.${className}`)
          .on('mousemove.tooltip', (d, i, elements) => {
            const [x, y] = mouse(this._container)
            this.show(template(d, i, elements), { x, y })
          })
          .on('mouseleave.tooltip', (d, i, elements) => this.hide())
      })
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  render (customDuration?: number): void {
  }
}
