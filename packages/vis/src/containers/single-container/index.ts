// Core
import { ContainerCore } from 'core/container'
import { ComponentCore } from 'core/component'

import { ComponentConfigInterface } from 'core/component/config'

// Utils
import { smartTransition } from 'utils/d3'

// Types
import { Sizing, ExtendedSizeComponent } from 'types/component'

// Config
import { SingleContainerConfig, SingleContainerConfigInterface } from './config'

export class SingleContainer<Data> extends ContainerCore {
  component: ComponentCore<Data>
  config: SingleContainerConfig<Data> = new SingleContainerConfig()

  constructor (element: HTMLElement, config?: SingleContainerConfigInterface<Data>, data?: Data) {
    super(element)

    if (config) {
      this.updateContainer(config)
      this.component = config.component
    }

    if (data) {
      this.setData(data)
    }
  }

  public setData (data: Data, preventRender?: boolean): void {
    const { config } = this

    if (this.component) this.component.setData(data)
    if (!preventRender) this.render()
    config.tooltip?.hide()
  }

  public updateContainer (containerConfig: SingleContainerConfigInterface<Data>, preventRender?: boolean): void {
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

  public updateComponent (componentConfig: ComponentConfigInterface, preventRender?: boolean): void {
    this.component.prevConfig = this.component.config
    this.component.setConfig(componentConfig)
    if (!preventRender) this.render()
  }

  public update (containerConfig: SingleContainerConfigInterface<Data>, componentConfig?, data?: Data): void {
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
    component.setSize(this.width, this.height)

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

  _onResize (): void {
    const { config } = this
    super._onResize()
    config.tooltip?.hide()
  }

  public destroy (): void {
    const { component, config } = this
    super.destroy()

    component?.destroy()
    config.tooltip?.destroy()
  }
}
