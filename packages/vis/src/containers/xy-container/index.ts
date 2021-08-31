// Copyright (c) Volterra, Inc. All rights reserved.
import { css } from 'emotion'
import { extent, merge as mergeArrays } from 'd3-array'
import { Selection } from 'd3-selection'

// Core
import { ContainerCore } from 'core/container'
import { XYComponentCore } from 'core/xy-component'
import { XYComponentConfigInterface } from 'core/xy-component/config'

// Data Model
import { SeriesDataModel } from 'data-models/series'

// Types
import { Spacing } from 'types/spacing'
import { Dimension } from 'types/dimension'
import { AxisType } from 'components/axis/types'

// Utils
import { clean, flatten, clamp } from 'utils/data'
import { guid } from 'utils/misc'

// Config
import { XYContainerConfig, XYContainerConfigInterface } from './config'
import {
  AreaConfigInterface,
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
  private _svgDefs: Selection<SVGDefsElement, unknown, null, undefined>
  private _clipPath: Selection<SVGClipPathElement, unknown, null, undefined>
  private _clipPathId = guid()
  private _axisMargin: Spacing = { top: 0, bottom: 0, left: 0, right: 0 }
  private _firstRender = true

  constructor (element, config?: XYContainerConfigInterface<Datum>, data?: Datum[]) {
    super(element)

    this._clipPath = this.svg.append('clipPath')
      .attr('id', this._clipPathId)
    this._clipPath.append('rect')

    // When the base tag is specified on the HTML head,
    //  Safari fails to find the corresponding filter URL.
    //  We have to provide tull url in order to fix that
    const highlightFilterId = 'saturate'
    const baseUrl = window.location.href.replace(window.location.hash, '')
    this.svg.attr('class', css`
      --highlight-filter-id: url(${baseUrl}#${highlightFilterId}); // defining a css variable
    `)

    this._svgDefs = this.svg.append('defs')
    this._svgDefs.append('filter')
      .attr('id', highlightFilterId)
      .attr('filterUnits', 'objectBoundingBox')
      .html('<feColorMatrix type="saturate" in="SourceGraphic" values="1.35"/>')

    if (config) {
      this.updateContainer(config)
    }

    if (data) {
      this.setData(data)
    }

    // Force re-render axes when fonts are loaded
    (document as any).fonts?.ready.then(() => {
      if (!this._firstRender) this._renderAxes(0)
    })
  }

  get components (): XYComponentCore<Datum>[] {
    return this.config.components
  }

  // Overriding ContainerCore default get width method to work with axis auto margin
  get width (): number {
    const margin = this._getMargin()
    return clamp(this.containerWidth - margin.left - margin.right, 0, Number.POSITIVE_INFINITY)
  }

  // Overriding ContainerCore default get height method to work with axis auto margin
  get height (): number {
    const margin = this._getMargin()

    return clamp(this.containerHeight - margin.top - margin.bottom, 0, Number.POSITIVE_INFINITY)
  }

  setData (data: Datum[], preventRender?: boolean): void {
    const { components, config } = this
    if (!data) return
    this.datamodel.data = data

    components.forEach((c, i) => {
      c.setData(data)
    })

    config.crosshair?.setData(data)
    config.xAxis?.setData(data)
    config.yAxis?.setData(data)
    config.tooltip?.hide()
    if (!preventRender) this.render()
  }

  updateContainer (containerConfig: XYContainerConfigInterface<Datum>, preventRender?: boolean): void {
    super.updateContainer(containerConfig)
    this.removeAllChildren()

    // If there were any new components added we need to pass them data
    this.setData(this.datamodel.data, false)

    // Set up the axes
    if (containerConfig.xAxis) {
      this.config.xAxis.config.type = AxisType.X
      this.element.appendChild(containerConfig.xAxis.element)
    }
    if (containerConfig.yAxis) {
      this.config.yAxis.config.type = AxisType.Y
      this.element.appendChild(containerConfig.yAxis.element)
    }

    // Re-insert elements to the DOM
    for (const c of this.components) {
      this.element.appendChild(c.element)
    }

    // Set up the tooltip
    const tooltip = containerConfig.tooltip
    if (tooltip) {
      if (!tooltip.hasContainer()) tooltip.setContainer(this._container)
      tooltip.setComponents(this.components)
    }

    // Set up the crosshair
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

    this.updateScales(...this.components, config.xAxis, config.yAxis, config.crosshair)
    if (!preventRender) this.render()
  }

  update (containerConfig: XYContainerConfigInterface<Datum>, componentConfigs?: XYComponentConfigInterface<Datum>[], data?: Datum[]): void {
    if (containerConfig) this.updateContainer(containerConfig, true)
    if (componentConfigs) this.updateComponents(componentConfigs, true)
    if (data) this.setData(data, true)
    this.render()
  }

  _render (customDuration?: number): void {
    const { config } = this
    super._render()

    // Calculate extra margin required to fit the axes
    if (config.autoMargin) {
      this._setAutoMargin()
    }

    // Get chart total margin after auto margin calculations
    const margin = this._getMargin()

    // Update Scales of all the components at once to calculate required paddings and sync them
    this.updateScales(...this.components, config.xAxis, config.yAxis, config.crosshair)

    // Render components
    for (const c of this.components) {
      c.g.attr('transform', `translate(${margin.left},${margin.top})`)
        .style('clip-path', c.clippable ? `url(#${this._clipPathId})` : null)
        .style('-webkit-clip-path', c.clippable ? `url(#${this._clipPathId})` : null)

      c.render(customDuration)
    }

    this._renderAxes(this._firstRender ? 0 : customDuration)

    // Clip Rect
    this._clipPath.select('rect')
      .attr('width', this.width)
      .attr('height', this.height)

    // Tooltip
    config.tooltip?.update() // Re-bind events

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
      crosshair.g.attr('transform', `translate(${margin.left},${margin.top})`)
      crosshair.hide()
    }

    this._firstRender = false
  }

  updateScales<T extends XYComponentCore<Datum>> (...components: T[]): void {
    const c = clean(components || this.components)
    this._setScales(...c)
    this._updateScalesDomain(...c)
    this._updateScalesRange(...c)
  }

  _setScales<T extends XYComponentCore<Datum>> (...components: T[]): void {
    const { config: { dimensions } } = this
    if (!components) return

    // Loop over all the dimensions
    Object.keys(dimensions).forEach(key => {
      const dim: Dimension = dimensions[key]
      components.forEach(c => c.setScale(key, dim.scale))
    })
  }

  _updateScalesDomain<T extends XYComponentCore<Datum>> (...components: T[]): void {
    const { config: { dimensions, preventEmptyDomain, scaleByDomain } } = this
    if (!components) return

    // Passing the scaleByDomain property to the components
    components.forEach(c => { c.config.scaleByDomain = scaleByDomain })

    // Loop over all the dimensions
    Object.keys(dimensions).forEach(key => {
      const dim: Dimension = dimensions[key]
      let [min, max] = extent(mergeArrays(components.map(c => c.getDataExtent(key))) as number[]) // Components with undefined dimension accessors will return [undefined, undefined] but d3.extent will take care of that
      if (preventEmptyDomain && (min === max) && isFinite(min)) max = min + 1

      const domainMin = dim.domain?.[0] ?? min ?? 0
      const domainMax = dim.domain?.[1] ?? max ?? 1
      const domain = [
        clamp(domainMin, dim.domainMinConstraint?.[0] ?? Number.NEGATIVE_INFINITY, dim.domainMinConstraint?.[1] ?? Number.POSITIVE_INFINITY),
        clamp(domainMax, dim.domainMaxConstraint?.[0] ?? Number.NEGATIVE_INFINITY, dim.domainMaxConstraint?.[1] ?? Number.POSITIVE_INFINITY),
      ]
      components.forEach(c => c.setScaleDomain(key, domain))
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
    const { config: { xAxis, yAxis } } = this
    const margin = this._getMargin()

    const axes = clean([xAxis, yAxis])
    axes.forEach(axis => {
      const offset = axis.getOffset(margin)
      axis.g.attr('transform', `translate(${offset.left},${offset.top})`)
      axis.render(duration)
    })
  }

  _setAutoMargin (): void {
    const { config: { xAxis, yAxis } } = this

    // At first we need to set the domain to the scales
    const components = clean([...this.components, xAxis, yAxis])
    this._updateScalesDomain(...components)

    // Calculate margin required by the axes
    // We do two iterations on the first render, because the amount and size of ticks can change
    //    after new margin are calculated and applied (axies dimentions will change).
    //    That's needed for correct label placement.
    const numIterations = this._firstRender ? 2 : 1
    for (let i = 0; i < numIterations; i += 1) {
      const axisMargin: Spacing = { top: 0, bottom: 0, left: 0, right: 0 }
      this._updateScalesRange(...components)
      const axes = clean([xAxis, yAxis])
      axes.forEach(axis => {
        axis.preRender()

        const m = axis.getRequiredMargin()
        if (axisMargin.top < m.top) axisMargin.top = m.top
        if (axisMargin.bottom < m.bottom) axisMargin.bottom = m.bottom
        if (axisMargin.left < m.left) axisMargin.left = m.left
        if (axisMargin.right < m.right) axisMargin.right = m.right
      })

      this._axisMargin = axisMargin
    }
  }

  _getMargin (): Spacing {
    const { config: { margin } } = this

    return {
      top: margin.top + this._axisMargin.top,
      bottom: margin.bottom + this._axisMargin.bottom,
      left: margin.left + this._axisMargin.left,
      right: margin.right + this._axisMargin.right,
    }
  }

  public destroy (): void {
    const { components, config: { tooltip, crosshair, xAxis, yAxis } } = this
    super.destroy()

    for (const c of components) c?.destroy()
    tooltip?.destroy()
    crosshair?.destroy()
    xAxis?.destroy()
    yAxis?.destroy()
  }
}
