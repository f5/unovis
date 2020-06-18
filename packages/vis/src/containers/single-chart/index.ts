// Copyright (c) Volterra, Inc. All rights reserved.
// import { extent } from 'd3-array'

// Core
import { ContainerCore } from 'core/container'
import { ComponentCore } from 'core/component'

// import { ComponentConfig } from 'core/component/config'
import { XYComponentConfigInterface } from 'core/xy-component/config'

// Utils
// import { getValue, merge } from 'utils/data'

// Types
import { ExtendedSizeComponent } from 'types/component'

// Config
import { SingleChartConfig, SingleChartConfigInterface } from './config'

export class SingleChart<Datum> extends ContainerCore {
  component: ComponentCore<Datum>
  config: SingleChartConfig<Datum> = new SingleChartConfig()
  public fitScaleX: number = undefined

  constructor (element, config?: SingleChartConfigInterface<Datum>, data?: Datum) {
    super(element)

    if (config) {
      this.updateContainer(config)
      this.component = config.component
    }

    if (data) {
      this.setData(data)
    }
  }

  setData (data: Datum, preventRender?: boolean): void {
    if (this.component) this.component.setData(data)
    if (!preventRender) this.render()
  }

  updateContainer (containerConfig: SingleChartConfigInterface<Datum>, preventRender?: boolean): void {
    super.updateContainer(containerConfig)
    this.removeAllChildren()

    this.component = containerConfig.component
    this.element.appendChild(this.component.element)

    if (containerConfig.tooltip) {
      containerConfig.tooltip.setContainer(this._container)
      containerConfig.tooltip.setComponents([this.component])
    }

    if (!preventRender) this.render()
  }

  updateComponent (componentConfig: XYComponentConfigInterface<Datum>, preventRender?: boolean): void {
    this.component.prevConfig = this.component.config
    this.component.setConfig(componentConfig)
    if (!preventRender) this.render()
  }

  update (containerConfig: SingleChartConfigInterface<Datum>, componentConfig?, data?: Datum): void {
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

    component.render(customDuration)
    const extendedSizeComponent = component as ExtendedSizeComponent
    if (extendedSizeComponent.getWidth && extendedSizeComponent.getHeight) {
      const componentWidth = extendedSizeComponent.getWidth() + config.margin.left + config.margin.right
      const componentHeight = extendedSizeComponent.getHeight() + config.margin.top + config.margin.bottom

      this.fitScaleX = config.fitToWidth ? this.width / componentWidth : 1

      this.svg
        .attr('width', componentWidth * this.fitScaleX)
        .attr('height', componentHeight * this.fitScaleX)

      this.svg
        .attr('viewBox', config.fitToWidth ? `${0} ${0} ${componentWidth} ${componentHeight * this.fitScaleX}` : null)
        .attr('preserveAspectRatio', config.fitToWidth ? 'xMinYMin' : null)
    }
    if (config.tooltip) config.tooltip.update()
  }
}
