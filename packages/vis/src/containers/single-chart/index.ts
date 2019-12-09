// Copyright (c) Volterra, Inc. All rights reserved.

// Core
import { ContainerCore } from 'core/container'
import { ComponentCore } from 'core/component'
import { ComponentConfig } from 'core/component/config'

// Config
import { SingleChartConfig, SingleChartConfigInterface } from './config'

export class SingleChart extends ContainerCore {
  component: ComponentCore
  config: SingleChartConfig = new SingleChartConfig()
  data: any

  constructor (element, config?: SingleChartConfigInterface, data?) {
    super(element, config, data)

    if (config) {
      this.updateContainer(config)
      this.component = config.component
    }

    if (data) {
      this.setData(data)
    }
  }

  setData (data: any, preventRender?: boolean): void {
    this.data = data
    if (this.component) this.component.datamodel.data = data
    if (!preventRender) this.render()
  }

  updateContainer (containerConfig: SingleChartConfigInterface, preventRender?: boolean): void {
    super.updateContainer(containerConfig)

    this.component = containerConfig.component

    this.removeAllChildren()
    this.element.appendChild(this.component.element)
    if (!preventRender) this.render()
  }

  updateComponent (componentConfig: object = {}, preventRender?: boolean): void {
    const ConfigModel = (this.component.config.constructor as typeof ComponentConfig)
    this.component.prevConfig = this.component.config
    this.component.config = new ConfigModel().init(componentConfig)
    if (!preventRender) this.render()
  }

  update (containerConfig: SingleChartConfigInterface, componentConfig?, data?: any): void {
    if (containerConfig) this.updateContainer(containerConfig, true)
    if (componentConfig) this.updateComponent(componentConfig, true)
    if (data) this.setData(data, true)
    this.render()
  }

  _render (customDuration?: number): void {
    const { config, component } = this
    super._render()

    component.config.width = this.width
    component.config.height = this.height
    component.g
      .attr('transform', `translate(${config.margin.left},${config.margin.top})`)

    component._render(customDuration)
  }
}
