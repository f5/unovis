// Copyright (c) Volterra, Inc. All rights reserved.
// import { extent } from 'd3-array'

// Core
import { ContainerCore } from 'core/container'
import { ComponentCore } from 'core/component'

// import { ComponentConfig } from 'core/component/config'
import { XYComponentConfigInterface } from 'core/xy-component/config'

// Utils
import { smartTransition } from 'utils/d3'
// import { getValue, merge } from 'utils/data'

// Types
import { Sizing, ExtendedSizeComponent } from 'types/component'

// Config
import { SingleChartConfig, SingleChartConfigInterface } from './config'

export class SingleChart<Datum> extends ContainerCore {
  component: ComponentCore<Datum>
  config: SingleChartConfig<Datum> = new SingleChartConfig()

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

  public setData (data: Datum, preventRender?: boolean): void {
    if (this.component) this.component.setData(data)
    if (!preventRender) this.render()
  }

  public updateContainer (containerConfig: SingleChartConfigInterface<Datum>, preventRender?: boolean): void {
    super.updateContainer(containerConfig)
    this.removeAllChildren()

    this.component = containerConfig.component
    if (containerConfig.sizing) this.component.sizing = containerConfig.sizing
    this.element.appendChild(this.component.element)

    if (containerConfig.tooltip) {
      containerConfig.tooltip.setContainer(this._container)
      containerConfig.tooltip.setComponents([this.component])
    }

    if (!preventRender) this.render()
  }

  public updateComponent (componentConfig: XYComponentConfigInterface<Datum>, preventRender?: boolean): void {
    this.component.prevConfig = this.component.config
    this.component.setConfig(componentConfig)
    if (!preventRender) this.render()
  }

  public update (containerConfig: SingleChartConfigInterface<Datum>, componentConfig?, data?: Datum): void {
    if (containerConfig) this.updateContainer(containerConfig, true)
    if (componentConfig) this.updateComponent(componentConfig, true)
    if (data) this.setData(data, true)
    this.render()
  }

  public getFitWidthScale (): number {
    const { config, component } = this

    const extendedSizeComponent = component as ExtendedSizeComponent
    if (!extendedSizeComponent.getWidth) return 1

    const componentWidth = extendedSizeComponent.getWidth() + config.margin.left + config.margin.right
    return this.width / componentWidth
  }

  _render (customDuration?: number): void {
    const { config, component } = this
    component.config.width = this.width
    component.config.height = this.height

    component.g
      .attr('transform', `translate(${config.margin.left},${config.margin.top})`)

    component.render(customDuration)

    if (config.sizing === Sizing.EXTEND || config.sizing === Sizing.FIT_WIDTH) {
      const fitToWidth = config.sizing === Sizing.FIT_WIDTH
      const extendedSizeComponent = component as ExtendedSizeComponent

      const componentWidth = extendedSizeComponent.getWidth() + config.margin.left + config.margin.right
      const componentHeight = extendedSizeComponent.getHeight() + config.margin.top + config.margin.bottom

      const scale = fitToWidth ? this.getFitWidthScale() : 1

      smartTransition(this.svg, customDuration ?? component.config.duration)
        .attr('width', componentWidth * scale)
        .attr('height', componentHeight * scale)
        .attr('viewBox', fitToWidth ? `${0} ${0} ${componentWidth} ${componentHeight * scale}` : null)
        .attr('preserveAspectRatio', fitToWidth ? 'xMinYMin' : null)
    } else {
      this.svg
        .attr('width', this.containerWidth)
        .attr('height', this.containerHeight)
    }

    if (config.tooltip) config.tooltip.update()
  }
}
