// Copyright (c) Volterra, Inc. All rights reserved.
import { extent, merge as mergeArrays } from 'd3-array'
import { Selection } from 'd3-selection'

// Core
import { ContainerCore } from 'core/container'
import { XYComponentCore } from 'core/xy-component'

// Components
import { Axis } from 'components/axis'

// import { ComponentCore } from 'core/component'

// import { ComponentConfig } from 'core/component/config'
import { XYComponentConfigInterface } from 'core/xy-component/config'

// Types
import { AxisType } from 'types/axis'

// Utils
import { clean } from 'utils/data'
import { guid } from 'utils/misc'

// Config
import { XYContainerConfig, XYContainerConfigInterface } from './config'

export class XYContainer<Datum> extends ContainerCore {
  config: XYContainerConfig<Datum> = new XYContainerConfig()
  data: any
  private _clipPath: Selection<SVGGElement, object[], SVGGElement, object[]>
  private _clipPathId = guid()

  constructor (element, config?: XYContainerConfigInterface<Datum>, data?) {
    super(element)

    this._clipPath = this.svg.append('clipPath')
      .attr('id', this._clipPathId)
    this._clipPath.append('rect')

    if (config) {
      this.updateContainer(config)
    }

    if (data) {
      this.setData(data)
    }

    // Force re-render axes when fonts are loaded
    (document as any).fonts?.ready.then(this._renderAxes.bind(this, 0))
  }

  get components (): XYComponentCore<Datum>[] {
    return this.config.components
  }

  setData (data: any, preventRender?: boolean): void {
    const { components, config } = this
    if (!data) return
    this.data = data

    components.forEach((c, i) => {
      c.setData(data)
    })

    config.axes.x?.setData(data)
    config.axes.y?.setData(data)
    if (!preventRender) this.render()
  }

  updateContainer (containerConfig: XYContainerConfigInterface<Datum>, preventRender?: boolean): void {
    super.updateContainer(containerConfig)
    this.removeAllChildren()

    // If there were any new comonents added we need to pass them data
    this.setData(this.data, false)

    // Re-insert elements to the DOM
    for (const c of this.components) {
      this.element.appendChild(c.element)
    }

    // Set up the tooltip
    if (containerConfig.tooltip) {
      containerConfig.tooltip.setContainer(this._container)
      containerConfig.tooltip.setComponents(this.components)
    }

    // Set up the axes
    Object.keys(containerConfig.axes ?? {}).forEach(key => {
      this.config.axes[key].config.type = key as AxisType
    })

    if (containerConfig.axes?.x) this.element.appendChild(containerConfig.axes.x.element)
    if (containerConfig.axes?.y) this.element.appendChild(containerConfig.axes.y.element)

    // Clipping path
    this.element.appendChild(this._clipPath.node())

    // Rendering
    if (!preventRender) this.render()
  }

  updateComponents (componentConfigs: XYComponentConfigInterface<Datum>[], preventRender?: boolean): void {
    this.components.forEach((c, i) => {
      c.prevConfig = c.config
      c.setConfig(componentConfigs[i])
    })

    if (!preventRender) this.render()
  }

  update (containerConfig: XYContainerConfigInterface<Datum>, componentConfigs?: XYComponentConfigInterface<Datum>[], data?: any): void {
    if (containerConfig) this.updateContainer(containerConfig, true)
    if (componentConfigs) this.updateComponents(componentConfigs, true)
    if (data) this.setData(data, true)
    this.render()
  }

  _render (customDuration?: number): void {
    const { config } = this
    super._render()

    if (config.autoMargin) {
      Object.keys(config.axes).forEach(key => {
        this._setAutoMargin(this.config.axes[key])
      })
    }

    // Update Scales of all the components at once to calculate required paddings and sync them
    this.updateScales(...this.components, config.axes.x, config.axes.y)

    // Render components
    for (const c of this.components) {
      c.g.attr('transform', `translate(${config.margin.left},${config.margin.top})`)
        .attr('clip-path', c.clippable ? `url(#${this._clipPathId})` : null)

      c.render(customDuration)
    }

    this._renderAxes(customDuration)

    // Clip Rect
    this._clipPath.select('rect')
      .attr('width', this.width)
      .attr('height', this.height)

    // Tooltip
    config.tooltip?.update()
  }

  updateScales<T extends XYComponentCore<Datum>> (...components: T[]): void {
    const c = clean(components || this.components)
    this._updateScalesDomain(...c)
    this._updateScalesRange(...c)
  }

  _updateScalesDomain<T extends XYComponentCore<Datum>> (...components: T[]): void {
    const { config: { dimensions } } = this
    if (!components) return

    Object.keys(dimensions).forEach(key => {
      const domain = extent(mergeArrays(components.map(c => c.getDataExtent(key))) as number[])
      components.forEach(c => c.setScaleDomain(key, dimensions[key].domain ?? domain))
    })
  }

  _updateScalesRange<T extends XYComponentCore<Datum>> (...components: T[]): void {
    const { config: { dimensions, padding } } = this
    if (!components) return

    for (const c of components) {
      c.config.width = this.width
      c.config.height = this.height
    }

    Object.keys(dimensions).forEach(key => {
      const range = components.map(c => c.getScreenRange(key, padding)).reduce((res, r) => {
        if (r[0] > res[0]) res[0] = r[0]
        if (r[1] < res[1]) res[1] = r[1]
        return res
      }, [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY])
      const scaleRange = key === AxisType.Y ? [range[1], range[0]] : range
      components.forEach(c => c.setScaleRange(key, dimensions[key].range ?? scaleRange))
    })
  }

  _renderAxes (duration: number): void {
    const { config: { axes, margin } } = this
    Object.keys(axes).forEach(key => {
      const axis = axes[key]
      const offset = axis.getOffset(margin)
      axis.g.attr('transform', `translate(${offset.left},${offset.top})`)
      axis.render(duration)
    })
  }

  _setAutoMargin (axis: Axis<Datum>): void {
    const { config: { margin } } = this
    axis.autoWrapTickLabels = false
    this._updateScalesDomain(axis)
    axis.preRender()

    // Update container margin to fit axes
    const m = axis.calculateMargin()
    if (margin.top < m.top) margin.top = m.top
    if (margin.bottom < m.bottom) margin.bottom = m.bottom
    if (margin.left < m.left) margin.left = m.left
    if (margin.right < m.right) margin.right = m.right
  }
}
