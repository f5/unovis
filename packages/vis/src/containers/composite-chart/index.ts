// Copyright (c) Volterra, Inc. All rights reserved.
import { extent, merge as mergeArrays } from 'd3-array'

// Core
import { ContainerCore } from 'core/container'
import { XYCore } from 'core/xy-component'

// Components
import { Axis } from 'components/axis'

// import { ComponentCore } from 'core/component'

// import { ComponentConfig } from 'core/component/config'
import { XYConfigInterface } from 'core/xy-component/config'

// Enums
import { AxisType } from 'enums/axis'

// Utils

// Config
import { CompositeChartConfig, CompositeChartConfigInterface } from './config'

export class CompositeChart extends ContainerCore {
  config: CompositeChartConfig = new CompositeChartConfig()
  data: any

  constructor (element, config?: CompositeChartConfigInterface, data?) {
    super(element)

    if (config) {
      this.updateContainer(config)
    }

    if (data) {
      this.setData(data)
    }
  }

  get components (): XYCore[] {
    return this.config.components
  }

  setData (data: any, preventRender?: boolean): void {
    const { components, config } = this
    this.data = data

    components.forEach((c, i) => {
      c.setData(data)
    })

    config.axes.x?.setData(data)
    config.axes.y?.setData(data)
    if (!preventRender) this.render()
  }

  updateContainer (containerConfig: CompositeChartConfigInterface, preventRender?: boolean): void {
    super.updateContainer(containerConfig)
    this.removeAllChildren()

    for (const c of this.components) {
      this.element.appendChild(c.element)
    }

    if (containerConfig.tooltip) {
      containerConfig.tooltip.setContainer(this._container)
      containerConfig.tooltip.setComponents(this.components)
    }

    Object.keys(containerConfig.axes ?? {}).forEach(key => {
      this.config.axes[key].config.type = key as AxisType
    })

    if (containerConfig.axes?.x) this.element.appendChild(containerConfig.axes.x.element)
    if (containerConfig.axes?.y) this.element.appendChild(containerConfig.axes.y.element)

    if (!preventRender) this.render()
  }

  updateComponents (componentConfigs: XYConfigInterface[], preventRender?: boolean): void {
    this.components.forEach((c, i) => {
      c.prevConfig = c.config
      c.setConfig(componentConfigs[i])
    })

    if (!preventRender) this.render()
  }

  update (containerConfig: CompositeChartConfigInterface, componentConfigs?: XYConfigInterface[], data?: any): void {
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

    // Render components
    this.updateScales(...this.components)
    for (const c of this.components) {
      c.g.attr('transform', `translate(${config.margin.left},${config.margin.top})`)
      c.render(customDuration)
    }

    // Render axes
    Object.keys(config.axes).forEach(key => {
      const axis = config.axes[key]

      this.updateScales(axis)
      const offset = axis.getOffset(config.margin)
      axis.g.attr('transform', `translate(${offset.left},${offset.top})`)
      axis.render(customDuration)
    })

    // Tooltip
    config.tooltip?.update()
  }

  updateScales<T extends XYCore> (...components: T[]): void {
    this._updateScalesDomain(...(components || this.components))
    this._updateScalesRange(...(components || this.components))
  }

  _updateScalesDomain<T extends XYCore> (...components: T[]): void {
    const { config: { dimensions } } = this
    if (!components) return

    Object.keys(dimensions).forEach(key => {
      const domain = extent(mergeArrays(components.map(c => c.getDataExtent(key))) as number[])
      components.forEach(c => c.setScaleDomain(key, dimensions[key].domain ?? domain))
    })
  }

  _updateScalesRange<T extends XYCore> (...components: T[]): void {
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
      const scaleRange = key === 'y' ? [range[1], range[0]] : range
      components.forEach(c => c.setScaleRange(key, dimensions[key].range ?? scaleRange))
    })
  }

  _setAutoMargin (axis: Axis): void {
    const { config: { margin } } = this

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
