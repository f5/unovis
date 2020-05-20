// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection, mouse } from 'd3-selection'

// Core
// import { ContainerCore } from 'core/container'
import { ComponentCore } from 'core/component'

// Types
import { Position } from 'types/position'

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

  constructor (config: TooltipConfigInterface<T, TooltipDatum> = {}, containerElement?: HTMLElement) {
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
    // If it's not set (static), we set it to `relative` (not a good practice)
    if (getComputedStyle(this._container)?.position === 'static') {
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

  show (html: string | HTMLElement, pos: { x: number; y: number}): void {
    let tooltipElement
    if (html instanceof HTMLElement) {
      tooltipElement = html
    } else {
      tooltipElement = document.createElement('div');
      tooltipElement.innerHTML = html;
    }
    this.div.html('')
    this.div.classed('show', true).node()
      .appendChild(tooltipElement)

    this.place(pos)
  }

  hide (): void {
    this.div.classed('show', false)
  }

  place (pos): void {
    const { config } = this
    const width = this.element.offsetWidth
    const height = this.element.offsetHeight
    const containerHeight = this._container.offsetHeight
    const containerWidth = this._container.offsetWidth

    // dx and dy variables shift the tooltip from the default position (above the cursor, centred horizontally)
    const margin = 5
    const dx = config.horizontalPlacement === Position.LEFT ? -width - margin
      : config.horizontalPlacement === Position.CENTER ? -width / 2
        : margin
    const dy = config.verticalPlacement === Position.BOTTOM ? height + margin
      : config.verticalPlacement === Position.CENTER ? height / 2
        : -margin

    // Constraint to container
    const paddingX = 10
    const constraintX = pos.x > (containerWidth - width - dx - paddingX) ? (containerWidth - width - dx) - pos.x - paddingX
      : pos.x < -dx + paddingX ? -dx - pos.x + paddingX : 0

    const paddingY = 10
    const constraintY = pos.y > (containerHeight - dy - paddingY) ? containerHeight - dy - pos.y - paddingY
      : pos.y < (height - dy + paddingY) ? height - dy - pos.y + paddingY : 0

    // Place
    const x = pos.x + constraintX + dx
    const y = pos.y + constraintY + dy
    this.div
      .style('bottom', `${containerHeight - y}px`)
      .style('left', `${x}px`)
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
