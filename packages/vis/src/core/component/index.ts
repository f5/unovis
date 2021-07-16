// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'

// Core
import { CoreDataModel } from 'data-models/core'

// Types
import { ComponentType, Sizing } from 'types/component'

import { Spacing } from 'types/misc'

// Utils
import { throttle } from 'utils/data'

// Config
import { ComponentConfig, ComponentConfigInterface } from './config'

export class ComponentCore<CoreDatum> {
  element: HTMLElement | SVGGElement
  type: ComponentType = ComponentType.SVG
  g: any // Selection<HTMLElement | SVGElement, any, any, any>
  config: ComponentConfig
  prevConfig: ComponentConfig
  datamodel: CoreDataModel<CoreDatum> = new CoreDataModel()
  sizing: Sizing = Sizing.Fit

  events: {
    [selectorString: string]: {
      [eventType: string]: (((d: any, event: Event, i: number, elements: HTMLElement[] | SVGElement[]) => void)) | undefined;
    };
  } = {}

  _setUpComponentEventsThrottled = throttle(this._setUpComponentEvents, 500)
  _setCustomAttributesThrottled = throttle(this._setCustomAttributes, 500)

  constructor (type = ComponentType.SVG) {
    if (type === ComponentType.SVG) {
      this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    } else {
      this.element = document.createElement('div')
    }
    this.g = select(this.element)
  }

  setConfig<T extends ComponentConfigInterface> (config: T): void {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const ConfigModel = (this.config.constructor as typeof ComponentConfig)
    this.prevConfig = this.config
    this.config = new ConfigModel().init(config)
  }

  setData (data: CoreDatum): void {
    this.datamodel.data = data
  }

  render (duration = this.config.duration): void {
    this._render(duration)

    this._setUpComponentEventsThrottled()
    this._setCustomAttributesThrottled()
  }

  get bleed (): Spacing {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _render (duration = this.config.duration): void {
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _onEvent (d: any, i: number, elements: []): void {
  }

  _setCustomAttributes (): void {
    const attributeMap = this.config.attributes

    Object.keys(attributeMap).forEach(className => {
      Object.keys(attributeMap[className]).forEach(attr => {
        this.g.selectAll(`.${className}`)
          .attr(attr, attributeMap[className][attr])
      })
    })
  }

  _setUpComponentEvents (): void {
    // Set up default events
    this._bindEvents(this.events)

    // Set up user-defined events
    this._bindEvents(this.config.events, '.user')
  }

  _bindEvents (events, suffix = ''): void {
    Object.keys(events).forEach(className => {
      Object.keys(events[className]).forEach(eventType => {
        const selection = this.g.selectAll(`.${className}`)
        selection.on(eventType + suffix, (event: Event, d) => {
          const els = selection.nodes()
          const i = els.indexOf(event.currentTarget)
          return events[className][eventType](d, event, i, els)
        })
      })
    })
  }

  public destroy (): void {
    this.g?.remove()
  }
}
