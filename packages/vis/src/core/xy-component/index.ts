// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection } from 'd3-selection'

// Core
import { ComponentCore } from 'core/component'
import { SeriesDataModel } from 'data-models/series'

// Utils
import { filterDataByRange, getExtent, isArray } from 'utils/data'
import { DefaultRange } from 'utils/scale'

// Types
import { NumericAccessor } from 'types/accessor'
import { ContinuousScale, ScaleDimension } from 'types/scale'
import { Spacing } from 'types/spacing'

// Config
import { XYComponentConfig } from './config'

export class XYComponentCore<Datum> extends ComponentCore<Datum[]> {
  element: SVGGraphicsElement
  g: Selection<SVGGElement, unknown, null, undefined>
  config: XYComponentConfig<Datum>
  datamodel: SeriesDataModel<Datum> = new SeriesDataModel()
  /** Clippable components can be affected by a clipping path (set up in the container) */
  clippable = true
  /** Identifies whether the component displayed stacked data (eg StackedBar, Area) */
  stacked = false
  /** Identifies whether the component should not be included in Domain calculations */
  excludeFromDomainCalculation = false

  setScaleDomain (dimension: ScaleDimension, domain: number[]): void {
    const { config } = this
    if (dimension === ScaleDimension.X) config.xScale?.domain(domain)
    if (dimension === ScaleDimension.Y) config.yScale?.domain(domain)
  }

  setScaleRange (dimension: ScaleDimension, range: number[]): void {
    const { config } = this
    if (dimension === ScaleDimension.X) config.xScale?.range(range)
    if (dimension === ScaleDimension.Y) config.yScale?.range(range)
  }

  setScale (dimension: ScaleDimension, scale: ContinuousScale): void {
    const { config } = this
    if (scale && (dimension === ScaleDimension.X)) config.xScale = scale
    if (scale && (dimension === ScaleDimension.Y)) config.yScale = scale
  }

  getDataExtent (dimension: ScaleDimension): number[] {
    const { config, datamodel } = this

    switch (dimension) {
      case ScaleDimension.X: return this.getXDataExtent()
      case ScaleDimension.Y: return this.getYDataExtent()
      default: return getExtent(datamodel.data, config[dimension])
    }
  }

  getScreenRange (dimension: ScaleDimension, padding: Spacing = {}): number[] {
    switch (dimension) {
      case ScaleDimension.X: return this.getXScreenRange(padding)
      case ScaleDimension.Y: return this.getYScreenRange(padding)
      default: return DefaultRange
    }
  }

  getXDataExtent (): number[] {
    const { config, datamodel } = this
    return getExtent(datamodel.data, config.x)
  }

  getYDataExtent (): number[] {
    const { config, datamodel } = this

    const data = config.scaleByDomain ? filterDataByRange(datamodel.data, config.xScale.domain() as [number, number], config.x) : datamodel.data
    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]
    return getExtent(data, ...yAccessors)
  }

  getXScreenRange (padding: Spacing = {}): number[] {
    const bleed = this.bleed // Bleed depends on the domain. You should set it first in order to get correct results
    return [(padding.left ?? 0) + (bleed.left ?? 0), this._width - (padding.right ?? 0) - (bleed.right ?? 0)]
  }

  getYScreenRange (padding: Spacing = {}): number[] {
    const bleed = this.bleed // Bleed depends on the domain. You should set it first in order to get correct results
    return [(padding.top ?? 0) + (bleed.top ?? 0), this._height - (padding.bottom ?? 0) - (bleed.bottom ?? 0)]
  }
}
