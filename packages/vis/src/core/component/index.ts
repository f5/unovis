// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection } from 'd3-selection'
import { Transition } from 'd3-transition'

// Core
import { CoreDataModel } from 'data-models/core'

// Utils
import { throttle } from 'utils/data'

// Types
import { ComponentType, Sizing } from 'types/component'
import { Spacing } from 'types/spacing'

// Local Types
import { VisEventCallback, VisEventType } from './types'

// Config
import { ComponentConfig, ComponentConfigInterface } from './config'

export class ComponentCore<
  CoreDatum,
  ConfigClass extends ComponentConfig = ComponentConfig,
  ConfigInterface extends ComponentConfigInterface = ComponentConfigInterface,
> {
  element: SVGGElement | HTMLElement
  type: ComponentType = ComponentType.SVG
  g: Selection<SVGGElement, unknown, null, undefined> | Selection<HTMLElement, unknown, null, undefined>
  config: ConfigClass
  prevConfig: ConfigClass
  datamodel: CoreDataModel<CoreDatum> = new CoreDataModel()
  sizing: Sizing | string = Sizing.Fit

  events: {
    [selector: string]: {
      [eventType in VisEventType]?: VisEventCallback;
    };
  } = {}

  /** Component width in pixels. This property is set automatically by the container. */
  protected _width = 400
  /** Component height in pixels. This property is set automatically by the container. */
  protected _height = 200

  _setUpComponentEventsThrottled = throttle(this._setUpComponentEvents, 500)
  _setCustomAttributesThrottled = throttle(this._setCustomAttributes, 500)

  constructor (type = ComponentType.SVG) {
    if (type === ComponentType.SVG) {
      this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    } else {
      this.element = document.createElement('div')
    }
    this.g = select(this.element) as Selection<SVGGElement, unknown, null, undefined> | Selection<HTMLElement, unknown, null, undefined>

    // Setting the root class if available
    // eslint-disable-next-line dot-notation
    const rootClass = this.constructor?.['selectors']?.root as string
    if (rootClass) this.g.attr('class', rootClass)
  }

  setConfig (config: ConfigInterface): void {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const ConfigModel = (this.config.constructor as typeof ComponentConfig)
    this.prevConfig = this.config
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (this.prevConfig?.xScale) config.xScale = this.prevConfig.xScale
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (this.prevConfig?.yScale) config.yScale = this.prevConfig.yScale
    this.config = new ConfigModel().init(config) as ConfigClass
  }

  setData (data: CoreDatum): void {
    this.datamodel.data = data
  }

  setSize (width: number, height: number): void {
    if (isFinite(width)) this._width = width
    if (isFinite(height)) this._height = height
  }

  render (duration = this.config.duration): void {
    this._render(duration)

    const ANIMATING_ATTR = 'animating'
    if (duration) {
      this.g.attr(ANIMATING_ATTR, '')
      const transition = this.g
        .transition(ANIMATING_ATTR)
        .duration(duration) as Transition<SVGGElement | HTMLElement, unknown, null, undefined>

      transition.on('end interrupt', () => {
        this.g.attr(ANIMATING_ATTR, null)
      })
    }
    this._setUpComponentEventsThrottled()
    this._setCustomAttributesThrottled()
  }

  get bleed (): Spacing {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _render (duration = this.config.duration): void {
  }

  private _setCustomAttributes (): void {
    const attributeMap = this.config.attributes

    Object.keys(attributeMap).forEach(className => {
      Object.keys(attributeMap[className]).forEach(attr => {
        (this.g as Selection<SVGGElement | HTMLElement, unknown, null, undefined>)
          .selectAll(`.${className}`)
          .attr(attr, attributeMap[className][attr])
      })
    })
  }

  private _setUpComponentEvents (): void {
    // Set up default events
    this._bindEvents(this.events)

    // Set up user-defined events
    this._bindEvents(this.config.events, '.user')
  }

  private _bindEvents (events = this.events, suffix = ''): void {
    Object.keys(events).forEach(className => {
      Object.keys(events[className]).forEach(eventType => {
        const selection = (this.g as Selection<SVGGElement | HTMLElement, unknown, null, undefined>).selectAll(`.${className}`)
        selection.on(eventType + suffix, (event: Event, d) => {
          const els = selection.nodes()
          const i = els.indexOf(event.currentTarget as SVGGElement | HTMLElement)
          return events[className][eventType](d, event, i, els)
        })
      })
    })
  }

  public destroy (): void {
    this.g?.remove()
  }
}
