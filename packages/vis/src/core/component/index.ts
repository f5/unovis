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
  g: any
  config: ComponentConfig
  prevConfig: ComponentConfig
  datamodel: CoreDataModel<CoreDatum> = new CoreDataModel()
  sizing: Sizing = Sizing.FIT

  events = {}
  _setUpComponentEventsThrottled = throttle(this._setUpComponentEvents, 500)

  constructor (type = ComponentType.SVG) {
    if (type === ComponentType.SVG) {
      this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    } else {
      this.element = document.createElement('div')
    }
    this.g = select(this.element)
  }

  setConfig<T extends ComponentConfigInterface> (config: T): void {
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

  _setUpComponentEvents (): void {
    // Set up default events
    this._bindEvents(this.events)

    // Set up user-defined events
    this._bindEvents(this.config.events, '.user')
  }

  _bindEvents (events, suffix = ''): void {
    Object.keys(events).forEach(className => {
      Object.keys(events[className]).forEach(eventType => {
        this.g.selectAll(`.${className}`)
          .on(eventType + suffix, (d, i, els) => events[className][eventType](d, i, els))
      })
    })
  }
}
