// Copyright (c) Volterra, Inc. All rights reserved.
import { extent, merge as mergeArrays } from 'd3-array'

// Core
import { ContainerCore } from 'core/container'
import { XYCore } from 'core/xy-component'

// import { ComponentCore } from 'core/component'

// import { ComponentConfig } from 'core/component/config'
import { XYConfigInterface } from 'core/xy-component/config'

// Utils
import { isArray } from 'utils/data'

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
    config.axes?.x?.setData(data)
    config.axes?.y?.setData(data)
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

    this._prerenderAxis(this.config.axes?.x, 'x')
    this._prerenderAxis(this.config.axes?.y, 'y')

    this.updateScales([
      ...this.components,
      ...[this.config.axes?.x, this.config.axes?.y].filter(d => d),
    ])

    for (const c of this.components) {
      c.g.attr('transform', `translate(${config.margin.left},${config.margin.top})`)
      c.render(customDuration)
    }

    config.tooltip?.update()

    config.axes.x?.render(customDuration)
    config.axes.y?.render(customDuration)
  }

  updateScales (XYComponents?: XYCore[]): void {
    this._updateScalesDomain(this.components)
    this._updateScalesRange(XYComponents || this.components)
  }

  _updateScalesDomain (XYComponents: XYCore | XYCore[]): void {
    const { config: { dimensions } } = this
    if (!XYComponents) return
    const components = (isArray(XYComponents) ? XYComponents : [XYComponents]) as XYCore[]
    Object.keys(dimensions).forEach(key => {
      const domain = extent(mergeArrays(components.map(c => c.getDataExtent(key))) as number[])
      components.forEach(c => c.setScaleDomain(key, dimensions[key].domain ?? domain))
    })
  }

  _updateScalesRange (XYComponents: XYCore | XYCore[]): void {
    const { config: { dimensions, padding } } = this
    if (!XYComponents) return
    const components = (isArray(XYComponents) ? XYComponents : [XYComponents]) as XYCore[]
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

  _prerenderAxis (axis, type) {
    const { config } = this
    if (!axis) return
    axis.config.type = type
    this._updateScalesDomain(axis)
    axis.prerender()
    const size = axis.getSize()
    // update container margin to fit axes
    if (config.margin.top < size.top) config.margin.top = size.top
    if (config.margin.bottom < size.bottom) config.margin.bottom = size.bottom
    if (config.margin.left < size.left) config.margin.left = size.left
    if (config.margin.right < size.right) config.margin.right = size.right

    axis.setCompositeContainerMargin(config.margin)
  }
}
