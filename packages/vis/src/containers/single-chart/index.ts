// Copyright (c) Volterra, Inc. All rights reserved.
// import { extent } from 'd3-array'

// Core
import { ContainerCore } from 'core/container'
// import { ComponentCore } from 'core/component'
import { XYCore } from 'core/xy-component'

// import { ComponentConfig } from 'core/component/config'
import { XYConfigInterface } from 'core/xy-component/config'

// Utils
// import { getValue, merge } from 'utils/data'

// Config
import { SingleChartConfig, SingleChartConfigInterface } from './config'

export class SingleChart extends ContainerCore {
  component: XYCore
  config: SingleChartConfig = new SingleChartConfig()
  data: any

  constructor (element, config?: SingleChartConfigInterface, data?) {
    super(element)

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
    if (this.component) this.component.setData(data)
    if (!preventRender) this.render()
  }

  updateContainer (containerConfig: SingleChartConfigInterface, preventRender?: boolean): void {
    super.updateContainer(containerConfig)
    this.removeAllChildren()

    this.component = containerConfig.component
    this.element.appendChild(this.component.element)

    if (containerConfig.tooltip) {
      containerConfig.tooltip.setContainer(this._container)
      containerConfig.tooltip.setComponent(this.component)
    }

    if (!preventRender) this.render()
  }

  updateComponent (componentConfig: XYConfigInterface, preventRender?: boolean): void {
    this.component.prevConfig = this.component.config
    this.component.setConfig(componentConfig)
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
    this.updateScales()

    component.g
      .attr('transform', `translate(${config.margin.left},${config.margin.top})`)

    component.render(customDuration)

    if (config.tooltip) config.tooltip.update()
  }

  updateScales (): void {
    const { component, config: { dimensions, padding } } = this

    component.config.width = this.width
    component.config.height = this.height

    Object.keys(component.config.scales).forEach(key => {
      component.updateScale(key, dimensions[key] ?? {}, padding)
    })
  }
}
