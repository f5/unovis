// Copyright (c) Volterra, Inc. All rights reserved.
import { extent, merge as mergeArrays } from 'd3-array'
import { Selection } from 'd3-selection'

// Core
import { ContainerCore } from 'core/container'
import { XYComponentCore } from 'core/xy-component'

// Data Model
import { SeriesDataModel } from 'data-models/series'

// Components
import { Axis } from 'components/axis'

// import { ComponentCore } from 'core/component'

// import { ComponentConfig } from 'core/component/config'
import { XYComponentConfigInterface } from 'core/xy-component/config'

// Types
import { AxisType } from 'types/axis'

// Utils
import { clean, flatten } from 'utils/data'
import { guid } from 'utils/misc'

// Config
import { XYContainerConfig, XYContainerConfigInterface } from './config'
import {
  AreaConfigInterface,
  AxisConfigInterface,
  BrushConfigInterface,
  LineConfigInterface,
  ScatterConfigInterface,
  StackedBarConfigInterface,
  TimelineConfigInterface,
} from '../../components'

export type XYConfigInterface<Datum> = XYComponentConfigInterface<Datum>
  | StackedBarConfigInterface<Datum>
  | LineConfigInterface<Datum>
  | ScatterConfigInterface<Datum>
  | BrushConfigInterface<Datum>
  | TimelineConfigInterface<Datum>
  | AreaConfigInterface<Datum>

export class XYContainer<Datum> extends ContainerCore {
  config: XYContainerConfig<Datum> = new XYContainerConfig()
  datamodel: SeriesDataModel<Datum> = new SeriesDataModel()
  private _svgDefs: Selection<SVGDefsElement, object[], SVGGElement, object[]>
  private _clipPath: Selection<SVGGElement, object[], SVGGElement, object[]>
  private _clipPathId = guid()

  constructor (element, config?: XYContainerConfigInterface<Datum>, data?) {
    super(element)

    this._clipPath = this.svg.append('clipPath')
      .attr('id', this._clipPathId)
    this._clipPath.append('rect')

    this._svgDefs = this.svg.append('defs')
    this._svgDefs.append('filter')
      .attr('id', 'saturate')
      .attr('filterUnits', 'objectBoundingBox')
      .html('<feColorMatrix type="saturate" in="SourceGraphic" values="1.35"/>')

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
    this.datamodel.data = data

    components.forEach((c, i) => {
      c.setData(data)
    })

    config.crosshair?.setData(data)
    config.axes.x?.setData(data)
    config.axes.y?.setData(data)
    if (!preventRender) this.render()
  }

  updateContainer (containerConfig: XYContainerConfigInterface<Datum>, preventRender?: boolean): void {
    super.updateContainer(containerConfig)
    this.removeAllChildren()

    // If there were any new comonents added we need to pass them data
    this.setData(this.datamodel.data, false)

    // Set up the axes
    Object.keys(containerConfig.axes ?? {}).forEach(key => {
      this.config.axes[key].config.type = key as AxisType
    })

    if (containerConfig.axes?.x) this.element.appendChild(containerConfig.axes.x.element)
    if (containerConfig.axes?.y) this.element.appendChild(containerConfig.axes.y.element)

    // Re-insert elements to the DOM
    for (const c of this.components) {
      this.element.appendChild(c.element)
    }

    // Set up the tooltip
    const tooltip = containerConfig.tooltip
    if (tooltip) {
      tooltip.setContainer(this._container)
      tooltip.setComponents(this.components)
    }

    // Set up crosshair
    const crosshair = containerConfig.crosshair
    if (crosshair) {
      crosshair.setContainer(this.svg)
      // Pass tooltip
      if (tooltip) crosshair.config.tooltip = tooltip

      this.element.appendChild(crosshair.element)
    }

    // Clipping path
    this.element.appendChild(this._clipPath.node())

    // Defs
    this.element.appendChild(this._svgDefs.node())

    // Rendering
    if (!preventRender) this.render()
  }

  updateComponents (componentConfigs: XYConfigInterface<Datum>[], preventRender?: boolean): void {
    const { config } = this

    this.components.forEach((c, i) => {
      const componentConfig = componentConfigs[i]
      if (componentConfig) {
        c.prevConfig = c.config
        c.setConfig(componentConfigs[i])
      }
    })

    this.updateScales(...this.components, config.axes.x, config.axes.y, config.crosshair)
    if (!preventRender) this.render()
  }

  updateAxes (axesConfig: {[k: string]: AxisConfigInterface<Datum>}): void {
    Object.keys(this.config.axes).forEach((key) => {
      const axis: Axis<Datum> = this.config.axes[key]
      if (axesConfig[key]) {
        axis.setConfig({ ...axesConfig[key], type: key })
      }
    })
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
    this.updateScales(...this.components, config.axes.x, config.axes.y, config.crosshair)

    // Render components
    for (const c of this.components) {
      c.g.attr('transform', `translate(${config.margin.left},${config.margin.top})`)
        .style('clip-path', c.clippable ? `url(#${this._clipPathId})` : null)
        .style('-webkit-clip-path', c.clippable ? `url(#${this._clipPathId})` : null)

      c.render(customDuration)
    }

    this._renderAxes(customDuration)

    // Clip Rect
    this._clipPath.select('rect')
      .attr('width', this.width)
      .attr('height', this.height)

    // Tooltip
    config.tooltip?.update()

    // Crosshair
    const crosshair = config.crosshair
    if (crosshair) {
      // Pass accessors
      const yAccessors = this.components.filter(c => !c.stacked).map(c => c.config.y)
      const yStackedAccessors = this.components.filter(c => c.stacked).map(c => c.config.y)
      // eslint-disable-next-line dot-notation
      const baselineAccessor = this.components.find(c => c.config['baseline'])?.config['baseline']
      crosshair.config.x = crosshair.config.x || this.components[0]?.config.x
      crosshair.config.y = flatten(yAccessors)
      crosshair.config.yStacked = flatten(yStackedAccessors)
      crosshair.config.baseline = crosshair.config.baseline || baselineAccessor || null
      crosshair.g.attr('transform', `translate(${config.margin.left},${config.margin.top})`)
    }
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
      const [min, max] = extent(mergeArrays(components.map(c => c.getDataExtent(key))) as number[]) // Components with undefined dimenstion accessors will return [undefined, undefined] but d3.extent will take care of that
      const domain = [min || 0, max || 1] // Setting to D3 defaults when undefined
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
