// Copyright (c) Volterra, Inc. All rights reserved.
import { extent } from 'd3-array'

// Core
import { ComponentCore } from 'core/component'
import { SeriesDataModel } from 'data-models/series'

// Utils
import { filterDataByRange, getExtent, getValue, isArray } from 'utils/data'
import { defaultRange } from 'utils/scale'

// Types
import { NumericAccessor, Dimension, Spacing } from 'types/misc'

// Config
import { XYComponentConfig } from './config'

export class XYComponentCore<Datum> extends ComponentCore<Datum[]> {
  element: SVGGraphicsElement
  config: XYComponentConfig<Datum>
  datamodel: SeriesDataModel<Datum> = new SeriesDataModel()
  /** Clippable components can be affected by a clipping path (set up in the container) */
  clippable = true
  /** Identifies whether the component displayed stacked data (eg StackedBar, Area) */
  stacked = false

  setScaleDomain (key: string, domain: number[]): void {
    const { config: { scales } } = this
    if (!key || !scales[key]) return
    scales[key].domain(domain)
  }

  setScaleRange (key: string, range: number[]): void {
    const { config: { scales } } = this
    if (!key || !scales[key]) return
    scales[key].range(range)
  }

  updateScale (key: string, dim: Dimension = {}, padding: Spacing = {}): void {
    if (!key) return
    const { config, config: { scales, width, height }, datamodel: { data } } = this

    switch (key) {
    case 'x': {
      if (dim.scale) scales.x = dim.scale
      scales.x.domain(dim.domain ?? this.getXDataExtent())
      const bleed = this.bleed // Bleed depends on the domain settings ☝️
      scales.x.range(dim.range ?? [padding.left + bleed.left, width - padding.right - bleed.right])
      break
    }
    case 'y': {
      if (dim.scale) scales.y = dim.scale
      scales.y.domain(dim.domain ?? this.getYDataExtent())
      const bleed = this.bleed // Bleed depends on the domain settings ☝️
      scales.y.range(dim.range ?? [height - padding.bottom - bleed.bottom, padding.top + bleed.top])
      break
    }
    default: {
      if (!scales[key]) break
      if (dim.scale) scales[key] = dim.scale
      scales[key].domain(dim.domain ?? extent(data, d => getValue(d, config[key])))
      if (dim.range) scales[key].range(dim.range)
    }
    }
  }

  getDataExtent (accessorKey: string): number[] {
    const { config, datamodel } = this

    switch (accessorKey) {
    case 'x': return this.getXDataExtent()
    case 'y': return this.getYDataExtent()
    default: return getExtent(datamodel.data, config[accessorKey])
    }
  }

  getScreenRange (accessorKey: string, padding: Spacing = {}): number[] {
    switch (accessorKey) {
    case 'x': return this.getXScreenRange(padding)
    case 'y': return this.getYScreenRange(padding)
    default: return defaultRange
    }
  }

  getXDataExtent (): number[] {
    const { config, datamodel } = this
    return getExtent(datamodel.data, config.x)
  }

  getYDataExtent (): number[] {
    const { config, datamodel } = this

    const data = config.adaptiveYScale ? filterDataByRange(datamodel.data, config.scales.x.domain() as [number, number], config.x) : datamodel.data
    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]
    return getExtent(data, ...yAccessors)
  }

  getXScreenRange (padding: Spacing = {}): number[] {
    const bleed = this.bleed // Bleed depends on the domain. You should set it first in order to get correct results
    return [padding.left + bleed.left, this.config.width - padding.right - bleed.right]
  }

  getYScreenRange (padding: Spacing = {}): number[] {
    const bleed = this.bleed // Bleed depends on the domain. You should set it first in order to get correct results
    return [padding.top + bleed.top, this.config.height - padding.bottom - bleed.bottom]
  }
}
