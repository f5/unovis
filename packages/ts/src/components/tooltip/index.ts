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
  private _mutationObserver: MutationObserver
  private _hoveredElement: HTMLElement | SVGElement
  private _position: [number, number]
  private _overriddenHorizontalPlacement: Position.Left | Position.Right | string | undefined
  private _hideDelayTimeoutId: ReturnType<typeof setTimeout> | undefined
  private _showDelayTimeoutId: ReturnType<typeof setTimeout> | undefined

  constructor (config: TooltipConfigInterface = {}) {
    this.element = document.createElement('div')
    this.div = select(this.element)
      .attr('class', s.root)
      .classed(s.show, false)
      .classed(s.hidden, true)

    this.setConfig(config)
    this.components = this.config.components

    // Set up MutationObserver to automatically re-position the tooltip
    // if the content has been dynamically changed
    this._mutationObserver = new MutationObserver(() => {
      if (!this._isShown) return

      // Handle changes to the content of this.div
      // Add your logic here
      if (!this.config.followCursor && this._hoveredElement) {
        this.placeByElement(this._hoveredElement)
      } else if (this._position) {
        this.place({ x: this._position[0], y: this._position[1] })
      }
    })

    this._mutationObserver.observe(this.div.node(), { childList: true, subtree: true })
  }

  public setConfig (config: TooltipConfigInterface): void {
    this.prevConfig = this.config
    this.config = merge(this._defaultConfig, config)

    // Reset `this._overriddenHorizontalPlacement` if the `horizontalPlacement` has changed
    if (this.prevConfig.horizontalPlacement !== this.config.horizontalPlacement) {
      this.overrideHorizontalPlacement(undefined)
    }

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

  /** Show the tooltip immediately by providing content and position */
  public show (html: string | HTMLElement | null | void, pos: { x: number; y: number }): void {
    this.render(html)
    this.place(pos)
  }

  private _hide (): void {
    this.div
      .classed(s.show, false) // The `show` class triggers the opacity transition
      .on('transitionend', () => {
        // We hide the element once the transition completes
        // This ensures container overflow will not occur when the window is resized
        this.div.classed(s.hidden, !this._isShown)
      })

    this._isShown = false
  }

  /** Hides the tooltip after `hideDelay` */
  public hide (): void {
    window.clearTimeout(this._showDelayTimeoutId)
    if (this.config.hideDelay) {
      window.clearTimeout(this._hideDelayTimeoutId)
      this._hideDelayTimeoutId = setTimeout(() => this._hide(), this.config.hideDelay)
    } else {
      this._hide()
    }
  }

  private _display (): void {
    window.clearTimeout(this._hideDelayTimeoutId)
    this.div
      .classed(s.hidden, false) // The `hidden` class sets `display: none;`
      .classed(s.show, true) // The `show` class triggers the opacity transition

    this._isShown = true
  }

  /** Simply display the tooltip with its previous content on position, taking into account `showDelay` */
  public display (): void {
    if (this._isShown) return

    if (this.config.showDelay) {
      window.clearTimeout(this._showDelayTimeoutId)
      this._showDelayTimeoutId = setTimeout(() => {
        this._display()
        this.place({ x: this._position[0], y: this._position[1] })
      }, this.config.showDelay)
    } else {
      this._display()
    }
  }

  public place (pos: { x: number; y: number }): void {
    this._position = [pos.x, pos.y]

    if (!this.hasContainer()) {
      console.warn('Unovis | Tooltip: Container was not set or is not initialized yet')
      return
    }

    const { config } = this
    const tooltipWidth = this.element.offsetWidth
    const tooltipHeight = this.element.offsetHeight

    const horizontalPlacement = this._overriddenHorizontalPlacement ||
      (config.horizontalPlacement === Position.Auto
        ? Position.Center
        : config.horizontalPlacement)

    const verticalPlacement = config.verticalPlacement === Position.Auto
      ? ((pos.y - tooltipHeight) < 0 ? Position.Bottom : Position.Top)
      : config.verticalPlacement

    // Todo: Get rid of the hardcoded margin in version 2.0
    // Can be simply replaced with `verticalShift` and `horizontalShift`
    // but it'll be a breaking change
    const margin = 5
    const translateX = horizontalPlacement === Position.Left ? -tooltipWidth - margin - config.horizontalShift
      : horizontalPlacement === Position.Center ? -tooltipWidth / 2
        : margin + config.horizontalShift

    const translateY = verticalPlacement === Position.Bottom ? margin + config.verticalShift
      : verticalPlacement === Position.Center ? -tooltipHeight / 2
        : -margin - config.verticalShift - tooltipHeight

    // translateX and translateY variables shift the tooltip from the default position (above the cursor, centred horizontally)
    const [top, left] = this._constraintPosToContainer(pos.x + translateX, pos.y + translateY, tooltipWidth, tooltipHeight)
    this._applyPosition(top, left, tooltipHeight)
  }

  public placeByElement (hoveredElement: SVGElement | HTMLElement): void {
    const { config } = this

    // Store the hovered element and the event for future reference,
    // i.e. to re-position the tooltip if the content has been changed
    // by something else and it was captured by the MutationObserver
    this._hoveredElement = hoveredElement

    // Todo: Get rid of the hardcoded margin in version 2.0
    // Can be simply replaced with `verticalShift` and `horizontalShift`
    // but it'll be a breaking change
    const margin = 5
    const tooltipWidth = this.element.offsetWidth
    const tooltipHeight = this.element.offsetHeight
    const isContainerBody = this.isContainerBody()
    const containerWidth = isContainerBody ? window.innerWidth : this._container.scrollWidth
    const hoveredElementRect = hoveredElement.getBoundingClientRect()

    // We use D3's point transformation to get the correct position of the element by pretending it's a pointer event
    // See more: https://github.com/d3/d3-selection/blob/main/src/pointer.js
    const elementPos = isContainerBody ? [hoveredElementRect.x, hoveredElementRect.y] : pointer({
      clientX: hoveredElementRect.x,
      clientY: hoveredElementRect.y,
      pageX: hoveredElementRect.x,
      pageY: hoveredElementRect.y,
    }, this._container)

    const horizontalPlacement = this._overriddenHorizontalPlacement || (
      config.horizontalPlacement === Position.Auto
        ? (elementPos[0] - tooltipWidth < 0 ? Position.Right
          : elementPos[0] + tooltipWidth > containerWidth ? Position.Left : Position.Center)
        : config.horizontalPlacement
    )

    let translateX = 0
    switch (horizontalPlacement) {
      case Position.Left:
        translateX = -tooltipWidth - margin - config.horizontalShift
        break
      case Position.Right:
        translateX = hoveredElementRect.width + margin + config.horizontalShift
        break
      case Position.Center:
      default:
        translateX = (-tooltipWidth + hoveredElementRect.width) / 2
        break
    }

    const verticalPlacement = config.verticalPlacement === Position.Auto
      ? (horizontalPlacement !== Position.Center ? Position.Center
        : elementPos[1] - tooltipHeight < 0 ? Position.Bottom : Position.Top)
      : config.verticalPlacement

    let translateY = -tooltipHeight
    switch (verticalPlacement) {
      case Position.Center:
        translateY += (tooltipHeight + hoveredElementRect.height) / 2
        break
      case Position.Bottom:
        translateY += tooltipHeight + hoveredElementRect.height + margin + config.verticalShift
        break
      case Position.Top:
      default:
        translateY += -margin - config.verticalShift
        break
    }

    const [top, left] = this._constraintPosToContainer(elementPos[0] + translateX, elementPos[1] + translateY, tooltipWidth, tooltipHeight)
    this._applyPosition(top, left, tooltipHeight)
  }

  public isContainerBody (): boolean {
    return this._container === document.body
  }

  /** Allows to override the horizontal placement of the tooltip which is useful when you want to define custom positioning behavior.
   * This method has been added for Crosshair to allow it position tooltip left or right of the crosshair line
   * (see the `_showTooltip` method of the Crosshair component).
   */
  public overrideHorizontalPlacement (placement: Position.Left | Position.Right | string | undefined): void {
    this._overriddenHorizontalPlacement = placement
  }

  public render (html: string | HTMLElement | null | void): void {
    const { config, prevConfig } = this
    if (html instanceof HTMLElement) {
      const node = this.div.select(':first-child').node()
      if (node !== html) this.div.html('').append(() => html)
    } else if (html) {
      this.div.html(html)
    }

    this.div
      .classed(config.className ?? '', Boolean(config.className))
      .classed(s.nonInteractive, !config.allowHover)

    // Remove the previous class name if it was set
    if (prevConfig?.className && prevConfig.className !== config.className) {
      this.div.classed(prevConfig.className, false)
    }

    this.display()
  }

  private _applyPosition (x: number, y: number, tooltipHeight: number): void {
    const isContainerBody = this.isContainerBody()
    const containerHeight = isContainerBody ? window.innerHeight : this._container.scrollHeight

    this.div
      .classed(s.positionFixed, isContainerBody)
      .style('top', isContainerBody ? `${y}px` : 'unset')
      .style('bottom', !isContainerBody ? `${containerHeight - y - tooltipHeight}px` : 'unset')
      .style('left', `${x}px`)
  }

  private _constraintPosToContainer (top: number, left: number, tooltipWidth: number, tooltipHeight: number): [number, number] {
    const isContainerBody = this.isContainerBody()
    const containerHeight = isContainerBody ? window.innerHeight : this._container.scrollHeight
    const containerWidth = isContainerBody ? window.innerWidth : this._container.scrollWidth

    // // Constraint to container
    const paddingX = 10
    const hitRight = top > (containerWidth - tooltipWidth - paddingX)
    const hitLeft = top < paddingX
    const constrainedLeft = hitRight ? containerWidth - tooltipWidth - paddingX
      : hitLeft ? paddingX : top

    const paddingY = 10
    const hitBottom = left > (containerHeight - tooltipHeight - paddingY)
    const hitTop = left < paddingY
    const constrainedTop = hitBottom ? containerHeight - tooltipHeight - paddingY
      : hitTop ? paddingY : left

    return [
      containerWidth < tooltipWidth ? 0 : constrainedLeft,
      containerHeight < tooltipHeight ? 0 : constrainedTop,
    ]
  }

  private _setContainerPosition (): void {
    // Tooltip position calculation relies on the parent position
    // If it's not set (static), we set it to `relative` (not a good practice)
    if (this._container !== document.body && getComputedStyle(this._container)?.position === 'static') {
      this._container.style.position = 'relative'
    }
  }

  private _setUpEvents (): void {
    const { config } = this

    // We use the Event Delegation pattern to set up Tooltip events
    // Every component will have single `mousemove` and `mouseleave` event listener functions, where we'll check
    // the `path` of the event and trigger corresponding callbacks
    this.components.forEach(component => {
      const selection = select(component.element)
      selection
        .on('mousemove.tooltip', (e: MouseEvent) => {
          const { config: currentConfig } = this // get latest config because it could have been changed after the event was triggered
          const path: (HTMLElement | SVGGElement)[] = (e.composedPath && e.composedPath()) || (e as any).path || [e.target]

          // Go through all of the configured triggers
          for (const className of Object.keys(currentConfig.triggers)) {
            const template = currentConfig.triggers[className]
            if (!template) continue // Skip if the trigger is not configured

            const els = selection.selectAll<HTMLElement | SVGGElement, unknown>(`.${className}`).nodes()

            // Go through all of the elements in the event path (from the deepest element upwards)
            for (const el of path) {
              if (el === selection.node()) break // Break on the component's level (usually the `<g>` element)
              if (el.classList.contains(className)) { // If there's a match, show the tooltip
                const i = els.indexOf(el)
                const d = select(el).datum()
                const content = template(d, i, els)
                const [x, y] = this.isContainerBody() ? [e.clientX, e.clientY] : pointer(e, this._container)
                if (content === null) {
                  // If the content is `null`, we hide the tooltip
                  this.hide()
                } else {
                  // Otherwise we show the tooltip, but don't render the content if it's `undefined` or
                  // an empty string. This way we can allow it to work with things like `createPortal` in React
                  this.render(content)
                  if (currentConfig.followCursor) this.place({ x, y })
                  else this.placeByElement(el)
                }

                // Stop propagation to prevent other interfering events from being triggered, e.g. Crosshair
                e.stopPropagation()

                // Stop looking for other matches
                return
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

    // Set up Tooltip hover
    if (config.allowHover) {
      this.div
        .on('mouseenter.tooltip', this._display.bind(this))
        .on('mouseleave.tooltip', this.hide.bind(this))
    } else {
      this.div
        .on('mouseenter.tooltip', null)
        .on('mouseleave.tooltip', null)
    }
  }

  private _setUpAttributes (): void {
    const attributesMap = this.config.attributes
    if (!attributesMap) return

    Object.keys(attributesMap).forEach(attr => {
      this.div.attr(attr, attributesMap[attr])
    })
  }

  public destroy (): void {
    this._mutationObserver.disconnect()
    window.clearTimeout(this._hideDelayTimeoutId)
    window.clearTimeout(this._showDelayTimeoutId)
    this.div?.remove()
  }
}
