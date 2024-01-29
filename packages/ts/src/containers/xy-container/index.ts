import { css } from '@emotion/css'
import { extent, merge as mergeArrays } from 'd3-array'
import { Selection } from 'd3-selection'

// Global CSS variables (side effects import)
import 'styles/index'

// Core
import { ContainerCore } from 'core/container'
import { XYComponentCore } from 'core/xy-component'
import { XYComponentConfigInterface } from 'core/xy-component/config'

// Data Model
import { CoreDataModel } from 'data-models/core'

// Types
import { Spacing } from 'types/spacing'
import { AxisType } from 'components/axis/types'
import { ScaleDimension } from 'types/scale'
import { Direction } from 'types/direction'

// Utils
import { clamp, clean, flatten } from 'utils/data'
import { guid } from 'utils/misc'

// Config
import { XYContainerDefaultConfig, XYContainerConfigInterface } from './config'
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
  protected _defaultConfig = XYContainerDefaultConfig as XYContainerConfigInterface<Datum>
  protected _svgDefs: Selection<SVGDefsElement, unknown, null, undefined>
  public datamodel: CoreDataModel<Datum[]> = new CoreDataModel()
  public config: XYContainerConfigInterface<Datum> = this._defaultConfig
  private _clipPath: Selection<SVGClipPathElement, unknown, null, undefined>
  private _clipPathId = guid()
  private _axisMargin: Spacing = { top: 0, bottom: 0, left: 0, right: 0 }
  private _firstRender = true

  constructor (element: HTMLElement, config?: XYContainerConfigInterface<Datum>, data?: Datum[]) {
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

    this._svgDefs.append('filter')
      .attr('id', highlightFilterId)
      .attr('filterUnits', 'objectBoundingBox')
      .html('<feColorMatrix type="saturate" in="SourceGraphic" values="1.35"/>')

    if (config) {
      this.updateContainer(config, true)
    }

    if (data) {
      this.setData(data, true)
    }

    // Render if there are axes or components with data
    if (
      this.config.xAxis ||
      this.config.yAxis ||
      this.components?.some(c => c.datamodel.data)
    ) {
      this.render()
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

  public setData (data: Datum[], preventRender?: boolean): void {
    const { components, config } = this
    if (!data) return
    this.datamodel.data = data

    components.forEach((c) => {
      c.setData(data)
    })

    config.crosshair?.setData(data)
    config.xAxis?.setData(data)
    config.yAxis?.setData(data)
    config.tooltip?.hide()
    if (!preventRender) this.render()
  }

  public updateContainer (containerConfig: XYContainerConfigInterface<Datum>, preventRender?: boolean): void {
    super.updateContainer(containerConfig)
    this._removeAllChildren()

    // If there were any new components added we need to pass them data
    this.setData(this.datamodel.data, true)

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
      crosshair.tooltip = tooltip

      this.element.appendChild(crosshair.element)
    }

    // Clipping path
    this.element.appendChild(this._clipPath.node())

    // Defs
    this.element.appendChild(this._svgDefs.node())

    // Rendering
    if (!preventRender) this.render()
  }

  public updateComponents (componentConfigs: XYConfigInterface<Datum>[], preventRender?: boolean): void {
    const { config } = this

    this.components.forEach((c, i) => {
      const componentConfig = componentConfigs[i]
      if (componentConfig) {
        c.setConfig(componentConfigs[i])
      }
    })

    this._updateScales(...this.components, config.xAxis, config.yAxis, config.crosshair)
    if (!preventRender) this.render()
  }

  public update (containerConfig: XYContainerConfigInterface<Datum>, componentConfigs?: XYComponentConfigInterface<Datum>[], data?: Datum[]): void {
    if (data) this.datamodel.data = data // Just updating the data model because the `updateContainer` method has the `setData` step inside
    if (containerConfig) this.updateContainer(containerConfig, true)
    if (componentConfigs) this.updateComponents(componentConfigs, true)
    this.render()
  }

  protected _preRender (): void {
    const { config } = this
    super._preRender()

    // Calculate extra margin required to fit the axes
    if (config.autoMargin) {
      this._setAutoMargin()
    }

    // Update Scales of all the components at once to calculate required paddings and sync them
    this._updateScales(...this.components, config.xAxis, config.yAxis, config.crosshair)
  }

  protected _render (customDuration?: number): void {
    const { config } = this
    super._render()

    // Get chart total margin after auto margin calculations
    const margin = this._getMargin()

    // Render components
    for (const c of this.components) {
      c.g.attr('transform', `translate(${margin.left},${margin.top})`)
        .style('clip-path', c.clippable ? `url(#${this._clipPathId})` : null)
        .style('-webkit-clip-path', c.clippable ? `url(#${this._clipPathId})` : null)

      c.render(customDuration)
    }

    this._renderAxes(this._firstRender ? 0 : customDuration)

    // Clip Rect
    // Extending the clipping path to allow small overflow (e.g. Line will looks better that way when it touches the edges)
    const clipPathExtension = 2
    this._clipPath.select('rect')
      .attr('x', -clipPathExtension)
      .attr('y', -clipPathExtension)
      .attr('width', this.width + 2 * clipPathExtension)
      .attr('height', this.height + 2 * clipPathExtension)

    // Tooltip
    config.tooltip?.update() // Re-bind events

    // Crosshair
    const crosshair = config.crosshair
    if (crosshair) {
      // Pass accessors
      const yAccessors = this.components.filter(c => !c.stacked).map(c => c.config.y)
      const yStackedAccessors = this.components.filter(c => c.stacked).map(c => c.config.y)
      const baselineComponentConfig = this.components.find(c => (c.config as AreaConfigInterface<Datum>).baseline)?.config as AreaConfigInterface<Datum>
      const baselineAccessor = baselineComponentConfig?.baseline

      crosshair.accessors = {
        x: this.components[0]?.config.x,
        y: flatten(yAccessors),
        yStacked: flatten(yStackedAccessors),
        baseline: baselineAccessor,
      }

      crosshair.g.attr('transform', `translate(${margin.left},${margin.top})`)
        .style('clip-path', `url(#${this._clipPathId})`)
        .style('-webkit-clip-path', `url(#${this._clipPathId})`)
      crosshair.hide()
    }

    this._firstRender = false
  }

  private _updateScales<T extends XYComponentCore<Datum>> (...components: T[]): void {
    const c = clean(components || this.components)
    this._setScales(...c)
    this._updateScalesDomain(...c)
    this._updateScalesRange(...c)
  }

  private _setScales<T extends XYComponentCore<Datum>> (...components: T[]): void {
    const { config } = this
    if (!components) return

    // Set the X and Y scales
    if (config.xScale) components.forEach(c => c.setScale(ScaleDimension.X, config.xScale))
    if (config.yScale) components.forEach(c => c.setScale(ScaleDimension.Y, config.yScale))
  }

  private _updateScalesDomain<T extends XYComponentCore<Datum>> (...components: T[]): void {
    const { config } = this
    if (!components) return

    const componentsWithDomain = components.filter(c => !c.config.excludeFromDomainCalculation)

    // Loop over all the dimensions
    Object.values(ScaleDimension).forEach((dimension: ScaleDimension) => {
      const [min, max] = extent(
        mergeArrays(
          componentsWithDomain.map(c => c.getDataExtent(dimension, config.scaleByDomain))
        ) as number[]
      ) // Components with undefined dimension accessors will return [undefined, undefined] but d3.extent will take care of that

      const configuredDomain = dimension === ScaleDimension.Y ? config.yDomain : config.xDomain
      const configuredDomainMinConstraint = dimension === ScaleDimension.Y ? config.yDomainMinConstraint : config.xDomainMinConstraint
      const configuredDomainMaxConstraint = dimension === ScaleDimension.Y ? config.yDomainMaxConstraint : config.xDomainMaxConstraint
      const domainMin = configuredDomain?.[0] ?? min ?? 0
      const domainMax = configuredDomain?.[1] ?? max ?? 1
      const domain = [
        clamp(domainMin, configuredDomainMinConstraint?.[0] ?? Number.NEGATIVE_INFINITY, configuredDomainMinConstraint?.[1] ?? Number.POSITIVE_INFINITY),
        clamp(domainMax, configuredDomainMaxConstraint?.[0] ?? Number.NEGATIVE_INFINITY, configuredDomainMaxConstraint?.[1] ?? Number.POSITIVE_INFINITY),
      ]

      // Extend the X and Y domains if they're empty and `preventEmptyDomain` was explicitly set to `true`
      // or just the X domain if there is no data provided and `preventEmptyDomain` set to `null`
      if (domain[0] === domain[1]) {
        const hasDataProvided = componentsWithDomain.some(c => c.datamodel.data?.length > 0)
        if (config.preventEmptyDomain || (config.preventEmptyDomain === null && (!hasDataProvided || dimension === ScaleDimension.Y))) {
          domain[1] = domain[0] + 1
        }
      }

      components.forEach(c => c.setScaleDomain(dimension, domain))
    })
  }

  private _updateScalesRange<T extends XYComponentCore<Datum>> (...components: T[]): void {
    const { config } = this
    if (!components) return

    // Set initial scale range
    const isYDirectionSouth = config.yDirection === Direction.South
    const xRange: [number, number] = [config.padding.left ?? 0, this.width - config.padding.right ?? 0]
    const yRange: [number, number] = [this.height - config.padding.bottom ?? 0, config.padding.top ?? 0]
    if (isYDirectionSouth) yRange.reverse()

    for (const c of components) {
      c.setSize(this.width, this.height, this.containerWidth, this.containerHeight)
      c.setScaleRange(ScaleDimension.X, config.xRange ?? xRange)
      c.setScaleRange(ScaleDimension.Y, config.yRange ?? yRange)
    }

    // Get and combine bleed
    const bleed = components.map(c => c.bleed).reduce((bleed, b) => {
      for (const key of Object.keys(bleed)) {
        const k = key as keyof Spacing
        if (bleed[k] < b[k]) bleed[k] = b[k]
      }
      return bleed
    }, { top: 0, bottom: 0, left: 0, right: 0 })

    // Update scale range
    for (const c of components) {
      c.setScaleRange(ScaleDimension.X, [xRange[0] + bleed.left, xRange[1] - bleed.right])
      c.setScaleRange(
        ScaleDimension.Y,
        isYDirectionSouth
          ? [yRange[0] + bleed.top, yRange[1] - bleed.bottom] // if Y axis is directed downwards
          : [yRange[0] - bleed.bottom, yRange[1] + bleed.top] // if Y axis is directed upwards
      )
    }
  }

  private _renderAxes (duration: number): void {
    const { config: { xAxis, yAxis } } = this
    const margin = this._getMargin()

    const axes = clean([xAxis, yAxis])
    axes.forEach(axis => {
      const offset = axis.getOffset(margin)
      axis.g.attr('transform', `translate(${offset.left},${offset.top})`)
      axis.render(duration)
    })
  }

  private _setAutoMargin (): void {
    const { config: { xAxis, yAxis } } = this

    // At first we need to set the domain to the scales
    const components = clean([...this.components, xAxis, yAxis])
    this._updateScalesDomain(...components)

    // Calculate margin required by the axes
    // We do two iterations on the first render, because the amount and size of ticks can change
    //    after new margin are calculated and applied (axes dimensions will change).
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

  private _getMargin (): Spacing {
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
