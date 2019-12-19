// Copyright (c) Volterra, Inc. All rights reserved.
import { extent } from 'd3-array'

// Core
import { ComponentCore } from 'core/component'
import { SeriesDataModel } from 'data-models/series'

// Utils
import { getValue } from 'utils/data'
import { ColorType } from 'utils/color'

// Enums
import { Dimension } from 'utils/types'

// Config
import { XYConfig } from './config'

export class XYCore extends ComponentCore {
  config: XYConfig
  datamodel: SeriesDataModel = new SeriesDataModel()
  width: number
  height: number
  colorScale: any

  updateScale (prefix: string, dim: Dimension, padding) {
    if (!prefix) return
    const { config, datamodel: { data } } = this

    switch (prefix) {
    case 'x': {
      if (dim.scale) config.xScale = dim.scale
      config.xScale.domain(dim.domain ?? extent(data, d => getValue(d, config.x)))
      const bleed = this.bleed // Bleed depends on the domain settings ☝️
      config.xScale.range(dim.range ?? [padding.left + bleed.left, config.width - padding.right - bleed.right])
      break
    }
    case 'y': {
      if (dim.scale) config.yScale = dim.scale
      config.yScale.domain(dim.domain ?? this.getYDataExtent())
      const bleed = this.bleed // Bleed depends on the domain settings ☝️
      config.yScale.range(dim.range ?? [config.height - padding.bottom - bleed.bottom, padding.top + bleed.top])
      break
    }
    default: {
      const scaleName = `${prefix}Scale`
      if (!config[scaleName]) break
      if (dim.scale) config[scaleName] = dim.scale
      config[scaleName].domain(dim.domain ?? extent(data, d => getValue(d, config[prefix])))
      if (dim.range) config[scaleName].range(dim.range)
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
