// Global CSS variables (side effects import)
import '@/styles/index'

// Core
import { ContainerCore } from '@/core/container'
import { ComponentCore } from '@/core/component'
import { ComponentConfigInterface } from '@/core/component/config'

// Utils
import { smartTransition } from '@/utils/d3'

// Types
import { Sizing, isExtendedSizeComponent } from '@/types/component'

// Config
import { SingleContainerDefaultConfig, SingleContainerConfigInterface } from './config'

export class SingleContainer<Data> extends ContainerCore {
  protected _defaultConfig = SingleContainerDefaultConfig as SingleContainerConfigInterface<Data>
  public component: ComponentCore<Data>
  public config: SingleContainerConfigInterface<Data> = this._defaultConfig

  constructor (element: HTMLElement, config?: SingleContainerConfigInterface<Data>, data?: Data) {
    super(element)

    if (config) {
      this.updateContainer(config, true)
      this.component = config.component
    }

    if (data) {
      this.setData(data, true)
    }

    // Render if component exists and has data
    if (this.component?.datamodel.data) this.render()
  }

  public setData (data: Data, preventRender?: boolean): void {
    const { config } = this

    // Hide the tooltip only when the data has actually changed
    const hasDataUpdated = this.component?.datamodel.data !== data
    if (this.component) this.component.setData(data)
    if (!preventRender) this.render()
    if (hasDataUpdated) config.tooltip?.hide()
  }

  public updateContainer (containerConfig: SingleContainerConfigInterface<Data>, preventRender?: boolean): void {
    super.updateContainer(containerConfig)

    this.component = containerConfig.component

    const tooltip = containerConfig.tooltip
    if (tooltip) {
      if (!tooltip.hasContainer()) tooltip.setContainer(this._container)
      tooltip.setComponents([this.component])
    }

    // Sync the SVG children with the updated configuration, touching only the elements that changed
    this._reconcileChildren([
      this.component?.element,
      containerConfig.annotations?.element,
      this._svgDefs.node(),
      this._svgDefsExternal.node(),
    ])

    // Setting the sizing after the component's element has been attached because components can measure their DOM when it changes
    if (containerConfig.sizing && this.component) {
      const sizing = this._getEffectiveSizing()
      if (sizing !== containerConfig.sizing) {
        console.warn(`Unovis | Single Container: The component doesn't support the '${containerConfig.sizing}' sizing mode because it doesn't report its own size. Falling back to '${sizing}'`)
      }
      this.component.setSizing(sizing)
    }

    if (!preventRender) this.render()
  }

  public updateComponent (componentConfig: ComponentConfigInterface, preventRender?: boolean): void {
    this.component.setConfig(componentConfig)
    if (!preventRender) this.render()
  }

  public update (
    containerConfig: SingleContainerConfigInterface<Data>,
    componentConfig?: ComponentConfigInterface,
    data?: Data
  ): void {
    if (containerConfig) this.updateContainer(containerConfig, true)
    if (componentConfig) this.updateComponent(componentConfig, true)
    if (data) this.setData(data, true)
    this.render()
  }

  protected _getEffectiveSizing (): Sizing | string {
    const { sizing } = this.config
    const needsExtendedSize = sizing === Sizing.Extend || sizing === Sizing.FitWidth
    return needsExtendedSize && !isExtendedSizeComponent(this.component) ? Sizing.Fit : sizing
  }

  public getFitWidthScale (): number {
    const { config, component } = this
    if (!isExtendedSizeComponent(component)) return 1

    const componentWidth = component.getWidth() + config.margin.left + config.margin.right
    return this.width / componentWidth
  }

  protected _preRender (): void {
    const { config } = this
    super._preRender()

    // Pass size, margin, and the color function to the component and annotations
    this._propagateSizeAndStyleToComponents([this.component, config.annotations], config.margin)
  }

  protected _render (duration?: number): void {
    const { config, component } = this
    super._render(duration)

    component.g.attr('transform', `translate(${config.margin.left},${config.margin.top})`)
    component.render(duration)
    config.annotations?.render(duration)

    if (config.tooltip) config.tooltip.update()
    // Let a touch drag move the Tooltip instead of scrolling the page (see the `followTouchMove` Tooltip option)
    this.svg.style('touch-action', config.tooltip?.followsTouchMove() ? 'pinch-zoom' : null)
    config.onRenderComplete?.(this.svg.node(), config.margin, this.containerWidth, this.containerHeight, this.width, this.height)
  }

  // Re-defining the `render()` function to handle different sizing techniques (`Sizing.Extend` and `Sizing.FitWidth`)
  // Not calling `super.render()` because we don't want it to interfere with setting the SVG size here.
  public render (duration = this.config.duration): Promise<void> {
    const { config, component } = this
    const sizing = this._getEffectiveSizing()

    if ((sizing === Sizing.Extend || sizing === Sizing.FitWidth) && isExtendedSizeComponent(component)) {
      const fitToWidth = sizing === Sizing.FitWidth

      const componentWidth = component.getWidth() + config.margin.left + config.margin.right
      const componentHeight = component.getHeight() + config.margin.top + config.margin.bottom
      const scale = fitToWidth ? this.getFitWidthScale() : 1

      const currentWidth = this.svg.attr('width')
      const currentHeight = this.svg.attr('height')
      const scaledWidth = componentWidth * scale
      const scaledHeight = componentHeight * scale
      const animated = currentWidth || currentHeight

      smartTransition(this.svg, animated ? duration : 0)
        .attr('width', scaledWidth)
        .attr('height', scaledHeight)
        .attr('viewBox', `${0} ${0} ${componentWidth} ${fitToWidth ? scaledHeight : componentHeight}`)
        .attr('preserveAspectRatio', 'xMinYMin')
    } else {
      this.svg
        .attr('width', this.config.width || this.containerWidth)
        .attr('height', this.config.height || this.containerHeight)
    }

    // Schedule the actual rendering in the next frame (shared with ContainerCore.render)
    return this._scheduleRender(duration)
  }

  protected _onResize (): void {
    const { config } = this
    super._onResize()
    config.tooltip?.hide()
  }

  public destroy (): void {
    const { component, config } = this
    super.destroy()

    component?.destroy()
    config.tooltip?.destroy()
    config.annotations?.destroy()
  }
}
