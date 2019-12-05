// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'

// Core
import { CoreDataModel } from 'data-models/core'

// Config
import { ComponentConfig, ComponentConfigInterface } from './config'

export class ComponentCore {
  element: SVGElement
  g: any
  config: ComponentConfig
  prevConfig: ComponentConfig
  datamodel: CoreDataModel = new CoreDataModel()

  constructor (config?: ComponentConfigInterface) {
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    this.g = select(this.element)

    // if (config) this.setConfig(config)
  }

  // setConfig (config?: any): void {
  //   const ConfigModel = (this.config.constructor as typeof ComponentConfig)
  //   this.prevConfig = this.config
  //   this.config = new ConfigModel().init(config)
  // }

  // setData (data: any): void {
  //   this.datamodel.data = data
  // }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _render (customDuration?: number): void {
  }
}
