import { select, Selection, pointer } from 'd3-selection'

// Core
import { ComponentCore } from 'core/component'

// Types
import { Position } from 'types/position'

// Utils
import { merge, throttle } from 'utils/data'

// Config
import { TooltipDefaultConfig, TooltipConfigInterface } from './config'

// Style
import * as s from './style'

export class Tooltip {
  element: HTMLElement
  div: Selection<HTMLElement, unknown, null, undefined>
  protected _defaultConfig = TooltipDefaultConfig as TooltipConfigInterface
  public config: TooltipConfigInterface = this._defaultConfig
  prevConfig: TooltipConfigInterface
  components: ComponentCore<unknown>[]
  static selectors = s
  private _setUpEventsThrottled = throttle(this._setUpEvents, 500)
  private _setContainerPositionThrottled = throttle(this._setContainerPosition, 500)
  private _isShown = false
  private _container: HTMLElement

  constructor (config: TooltipConfigInterface = {}) {
    this.element = document.createElement('div')
    this.div = select(this.element)
      .attr('class', s.tooltip)

    this.setConfig(config)
    this.components = this.config.components
  }

  public setConfig (config: TooltipConfigInterface): void {
    this.prevConfig = this.config
    this.config = merge(this._defaultConfig, config)

    if (this.config.container && (this.config.container !== this.prevConfig?.container)) {
      this.setContainer(this.config.container)
    }

    this._setUpAttributes()
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

  public setComponents (components: ComponentCore<unknown>[]): void {
    this.components = components
  }

  public update (): void {
    if (!this._container) return

    this._setUpEventsThrottled()
  }

  public show (html: string | HTMLElement, pos: { x: number; y: number }): void {
    if (html instanceof HTMLElement) {
      const node = this.div.select(':first-child').node()
      if (node !== html) this.div.html('').append(() => html)
    } else {
      this.div.html(html)
    }

    this.div.classed(s.show, true)
    this._isShown = true
    this.place(pos)
  }

  public hide (): void {
    this.div.classed(s.show, false)
    this._isShown = false
  }

  public place (pos: { x: number; y: number }): void {
    if (!this.hasContainer()) {
      console.warn('Unovis | Tooltip: Container was not set or is not initialized yet')
      return
    }
    const { config } = this
    const isContainerBody = this.isContainerBody()
    const width = this.element.offsetWidth
    const height = this.element.offsetHeight
    const containerHeight = isContainerBody ? window.innerHeight : this._container.scrollHeight
    const containerWidth = isContainerBody ? window.innerWidth : this._container.scrollWidth

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
      .classed(s.positionFixed, isContainerBody)
      .style('top', isContainerBody ? `${y - height}px` : 'unset')
      .style('bottom', !isContainerBody ? `${containerHeight - y}px` : 'unset')
      .style('left', `${x}px`)
  }

  public isContainerBody (): boolean {
    return this._container === document.body
  }

  private _setContainerPosition (): void {
    // Tooltip position calculation relies on the parent position
    // If it's not set (static), we set it to `relative` (not a good practice)
    if (getComputedStyle(this._container)?.position === 'static') {
      this._container.style.position = 'relative'
    }
  }

  private _setUpEvents (): void {
    const { config: { triggers } } = this
    const isContainerBody = this.isContainerBody()

    // We use the Event Delegation pattern to set up Tooltip events
    // Every component will have single `mousemove` and `mouseleave` event listener functions, where we'll check
    // the `path` of the event and trigger corresponding callbacks
    this.components.forEach(component => {
      const selection = select(component.element)
      selection
        .on('mousemove.tooltip', (e: MouseEvent) => {
          const [x, y] = isContainerBody ? [e.clientX, e.clientY] : pointer(e, this._container)
          const path: (HTMLElement | SVGGElement)[] = (e.composedPath && e.composedPath()) || (e as any).path || [e.target]

          // Go through all of the configured triggers
          for (const className of Object.keys(triggers)) {
            const template = triggers[className]
            const els = selection.selectAll<HTMLElement | SVGGElement, unknown>(`.${className}`).nodes()

            // Go through all of the elements in the event path (from the deepest element upwards)
            for (const el of path) {
              if (el === selection.node()) break // Break on the component's level (usually the `<g>` element)
              if (el.classList.contains(className)) { // If there's a match, show the tooltip
                const i = els.indexOf(el)
                const d = select(el).datum()
                const content = template(d, i, els)
                if (content) this.show(content, { x, y })
                else this.hide()

                e.stopPropagation() // Stop propagation to prevent other interfering events from being triggered, e.g. Crosshair
                return // Stop looking for other matches
              }
            }
          }

          // Hide the tooltip if the event didn't pass through any of the configured triggers.
          // We use the `this._isShown` condition as a little performance optimization tweak
          // (we don't want the tooltip to update its class on every mouse movement, see `this.hide()`).
          if (this._isShown) this.hide()
        })
        .on('mouseleave.tooltip', (e: MouseEvent) => {
          e.stopPropagation() // Stop propagation to prevent other interfering events from being triggered, e.g. Crosshair
          this.hide()
        })
    })
  }

  private _setUpAttributes (): void {
    const attributesMap = this.config.attributes
    if (!attributesMap) return

    Object.keys(attributesMap).forEach(attr => {
      this.div.attr(attr, attributesMap[attr])
    })
  }

  public destroy (): void {
    this.div?.remove()
  }
}
