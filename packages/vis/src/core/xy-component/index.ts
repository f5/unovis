// Copyright (c) Volterra, Inc. All rights reserved.
import { extent } from 'd3-array'

// Core
import { ComponentCore } from 'core/component'
import { SeriesDataModel } from 'data-models/series'

// Utils
import { getValue } from 'utils/data'
import { ColorType } from 'utils/color'

// Enums
import { Dimension, Margin } from 'utils/types'

// Config
import { XYConfig } from './config'

export class XYCore extends ComponentCore {
  config: XYConfig
  datamodel: SeriesDataModel = new SeriesDataModel()
  width: number
  height: number
  colorScale: any

  updateScale (key: string, dim: Dimension = {}, padding: Margin = {}) {
    if (!key) return
    const { config, config: { scales, width, height }, datamodel: { data } } = this

    switch (key) {
    case 'x': {
      if (dim.scale) scales.x = dim.scale
      scales.x.domain(dim.domain ?? extent(data, d => getValue(d, config.x)))
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

  getColor (d, accessor) {
    const { config } = this
    const value = getValue(d, accessor)
    if (config.colorType === ColorType.Dynamic) return this.colorScale(value)
    else return value
  }

  getYDataExtent (): number[] {
    const { config, datamodel } = this
    return datamodel.getExtent(config.y)
  }
}
