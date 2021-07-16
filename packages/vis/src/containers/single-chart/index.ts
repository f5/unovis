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

    const tooltip = containerConfig.tooltip
    if (tooltip) {
      if (!tooltip.hasContainer()) tooltip.setContainer(this._container)
      tooltip.setComponents([this.component])
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

    if (config.sizing === Sizing.Extend || config.sizing === Sizing.FitWidth) {
      const fitToWidth = config.sizing === Sizing.FitWidth
      const extendedSizeComponent = component as ExtendedSizeComponent

      const componentWidth = extendedSizeComponent.getWidth() + config.margin.left + config.margin.right
      const componentHeight = extendedSizeComponent.getHeight() + config.margin.top + config.margin.bottom
      const scale = fitToWidth ? this.getFitWidthScale() : 1

      const currentWidth = this.svg.attr('width')
      const currentHeight = this.svg.attr('height')
      const scaledWidth = componentWidth * scale
      const scaledHeight = componentHeight * scale
      const animated = currentWidth || currentHeight
      smartTransition(this.svg, animated ? (customDuration ?? component.config.duration) : 0)
        .attr('width', scaledWidth)
        .attr('height', scaledHeight)
        .attr('viewBox', `${0} ${0} ${componentWidth} ${fitToWidth ? scaledHeight : componentHeight}`)
        .attr('preserveAspectRatio', 'xMinYMin')
    } else {
      this.svg
        .attr('width', this.containerWidth)
        .attr('height', this.containerHeight)
    }

    if (config.tooltip) config.tooltip.update()
  }

  public destroy (): void {
    const { component, config: { tooltip } } = this
    super.destroy()

    component?.destroy()
    tooltip?.destroy()
  }
}
