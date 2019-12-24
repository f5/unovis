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
    this.data = data
    this.components.forEach((c, i) => {
      c.setData(data)
    })
    if (!preventRender) this.render()
  }

  updateContainer (containerConfig: CompositeChartConfigInterface, preventRender?: boolean): void {
    super.updateContainer(containerConfig)
    this.removeAllChildren()

    for (const c of this.components) {
      this.element.appendChild(c.element)
    }

    // if (containerConfig.tooltip) {
    //   containerConfig.tooltip.setContainer(this._container)
    //   containerConfig.tooltip.setComponent(this.component)
    // }

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
    this.updateScales()

    for (const c of this.components) {
      c.g.attr('transform', `translate(${config.margin.left},${config.margin.top})`)
      c.render(customDuration)
    }

    if (config.tooltip) config.tooltip.update()
  }

  updateScales (): void {
    const { components, config: { dimensions, padding } } = this
    for (const c of this.components) {
      c.config.width = this.width
      c.config.height = this.height
    }

    Object.keys(dimensions).forEach(key => {
      const domain = extent(mergeArrays(components.map(c => c.getDataExtent(key))) as number[])
      components.forEach(c => c.setScaleDomain(key, dimensions[key].domain ?? domain))

      const range = components.map(c => c.getScreenRange(key, padding)).reduce((res, r) => {
        if (r[0] > res[0]) res[0] = r[0]
        if (r[1] < res[1]) res[1] = r[1]
        return res
      }, [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY])
      const scaleRange = key === 'y' ? [range[1], range[0]] : range
      components.forEach(c => c.setScaleRange(key, dimensions[key].range ?? scaleRange))
    })
  }
}
