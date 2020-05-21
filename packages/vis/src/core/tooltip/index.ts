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

  constructor (config: TooltipConfigInterface<T, TooltipDatum> = {}, containerElement?: HTMLElement | null) {
    this.config = new TooltipConfig<T, TooltipDatum>().init(config)
    this.components = this.config.components

    this.element = document.createElement('div')
    this.div = select(this.element)
      .attr('class', s.tooltip)

    this.setContainer(containerElement)
  }

  setContainer (container: HTMLElement | null): void {
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
    if (html instanceof HTMLElement) {
      this.div.html('').append(() => html)
    } else {
      this.div.html(html)
    }

    this.div.classed(s.show, true)
    this.place(pos)
  }

  hide (): void {
    this.div.classed(s.show, false)
  }

  place (pos): void {
    const { config } = this
    const width = this.element.offsetWidth
    const height = this.element.offsetHeight
    const containerHeight = this._container.offsetHeight
    const containerWidth = this._container.offsetWidth

    const horizontalPlacement = config.horizontalPlacement === Position.AUTO
      ? (pos.x > containerWidth / 2 ? Position.LEFT : Position.RIGHT)
      : config.horizontalPlacement

    const verticalPlacement = config.verticalPlacement === Position.AUTO
      ? (pos.y > containerHeight / 2 ? Position.TOP : Position.BOTTOM)
      : config.verticalPlacement

    // dx and dy variables shift the tooltip from the default position (above the cursor, centred horizontally)
    const margin = 5
    const dx = horizontalPlacement === Position.LEFT ? -width - margin - config.horizontalShift
      : horizontalPlacement === Position.CENTER ? -width / 2
        : margin + config.horizontalShift
    const dy = verticalPlacement === Position.BOTTOM ? height + margin + config.verticalShift
      : verticalPlacement === Position.CENTER ? height / 2
        : -margin - config.verticalShift

    // Constraint to container
    const paddingX = 10
    const hitRight = pos.x > (containerWidth - width - dx - paddingX)
    const hitLeft = pos.x < -dx + paddingX
    const constraintX = hitRight ? (containerWidth - width - dx) - pos.x - paddingX
      : hitLeft ? -dx - pos.x + paddingX : 0

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
