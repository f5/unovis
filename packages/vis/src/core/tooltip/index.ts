// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection, pointer } from 'd3-selection'

// Core
// import { ContainerCore } from 'core/container'
import { ComponentCore } from 'core/component'

// Types
import { Position, PositionStrategy } from 'types/position'

// Utils
import { throttle } from 'utils/data'

// Config
import { TooltipConfig, TooltipConfigInterface } from './config'

// Style
import * as s from './style'

export class Tooltip<T extends ComponentCore<any>, TooltipDatum> {
  element: HTMLElement
  div: Selection<HTMLElement, any, HTMLElement | null, any>
  config: TooltipConfig<T, TooltipDatum>
  prevConfig: TooltipConfig<T, TooltipDatum>
  components: T[]
  private _setUpEventsThrottled = throttle(this._setUpEvents, 500)
  private _setContainerPositionThrottled = throttle(this._setContainerPosition, 500)

  private _container: HTMLElement

  constructor (config: TooltipConfigInterface<T, TooltipDatum> = {}) {
    this.config = new TooltipConfig<T, TooltipDatum>().init(config)
    this.components = this.config.components

    this.element = document.createElement('div')
    this.div = select(this.element)
      .attr('class', s.tooltip)

    if (this.config.container) this.setContainer(this.config.container)
  }

  public setContainer (container: HTMLElement): void {
    this.element.parentNode?.removeChild(this.element)

    this._container = container
    this._container.appendChild(this.element)

    this._setContainerPositionThrottled()
  }

  public getContainer (): HTMLElement {
    return this._container
  }

  public hasContainer (): boolean {
    return !!this._container && this._container.isConnected
  }

  public setComponents (components: T[]): void {
    this.components = components
  }

  public update (): void {
    if (!this._container) return

    this._setUpEventsThrottled()
  }

  public show (html: string | HTMLElement, pos: { x: number; y: number}): void {
    if (html instanceof HTMLElement) {
      const node = this.div.select(':first-child').node()
      if (node !== html) this.div.html('').append(() => html)
    } else {
      this.div.html(html)
    }

    this.div.classed(s.show, true)
    this.place(pos)
  }

  public hide (): void {
    this.div.classed(s.show, false)
  }

  public place (pos): void {
    const { config } = this
    const positionFixed = config.positionStrategy === PositionStrategy.Fixed
    const width = this.element.offsetWidth
    const height = this.element.offsetHeight
    const containerHeight = positionFixed ? window.innerHeight : this._container.scrollHeight
    const containerWidth = positionFixed ? window.innerWidth : this._container.scrollWidth

    const horizontalPlacement = config.horizontalPlacement === Position.Auto
      ? (pos.x > containerWidth / 2 ? Position.Left : Position.Right)
      : config.horizontalPlacement

    const verticalPlacement = config.verticalPlacement === Position.Auto
      ? (pos.y > containerHeight / 2 ? Position.Top : Position.Bottom)
      : config.verticalPlacement

    // dx and dy variables shift the tooltip from the default position (above the cursor, centred horizontally)
    const margin = 5
    const dx = horizontalPlacement === Position.Left ? -width - margin - config.horizontalShift
      : horizontalPlacement === Position.Center ? -width / 2
        : margin + config.horizontalShift
    const dy = verticalPlacement === Position.Bottom ? height + margin + config.verticalShift
      : verticalPlacement === Position.Center ? height / 2
        : -margin - config.verticalShift

    // Constraint to container
    const paddingX = 10
    const hitRight = pos.x > (containerWidth - width - dx - paddingX)
    const hitLeft = pos.x < -dx + paddingX
    const constraintX = hitRight ? (containerWidth - width - dx) - pos.x - paddingX
      : hitLeft ? -dx - pos.x + paddingX : 0

    const paddingY = 10
    const hitBottom = pos.y > (containerHeight - dy - paddingY)
    const hitTop = pos.y < (height - dy + paddingY)
    const constraintY = hitBottom ? containerHeight - dy - pos.y - paddingY
      : hitTop ? height - dy - pos.y + paddingY : 0

    // Placing
    // If the container size is smaller than the the tooltip size we just stick the tooltip to the top / left
    const x = containerWidth < width ? 0 : pos.x + constraintX + dx
    const y = containerHeight < height ? height : pos.y + constraintY + dy

    this.div
      .classed(s.positionFixed, positionFixed)
      .style('top', positionFixed ? `${y - height}px` : 'unset')
      .style('bottom', !positionFixed ? `${containerHeight - y}px` : 'unset')
      .style('left', `${x}px`)
  }

  private _setContainerPosition (): void {
    // Tooltip position calculation relies on the parent position
    // If it's not set (static), we set it to `relative` (not a good practice)
    if (getComputedStyle(this._container)?.position === 'static') {
      this._container.style.position = 'relative'
    }
  }

  private _setUpEvents (): void {
    const { config: { triggers, positionStrategy } } = this

    Object.keys(triggers).forEach(className => {
      const template = triggers[className]
      this.components.forEach(component => {
        const selection = select(component.element).selectAll<HTMLElement | SVGGElement, unknown>(`.${className}`)
        selection
          .on('mousemove.tooltip', (e: MouseEvent, d: TooltipDatum) => {
            const [x, y] = positionStrategy === PositionStrategy.Fixed ? [e.clientX, e.clientY] : pointer(e, this._container)
            const els = selection.nodes()
            const i = els.indexOf(e.currentTarget as any)
            const content = template(d, i, els)
            if (content) this.show(content, { x, y })
            else this.hide()
          })
          .on('mouseleave.tooltip', () => this.hide())
      })
    })
  }

  public destroy (): void {
    this.div?.remove()
  }
}
