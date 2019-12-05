// Copyright (c) Volterra, Inc. All rights reserved.
import { extent } from 'd3-array'

// Core
import { ComponentCore } from 'core/component'

// Utils
import { getValue } from 'utils/data'
import { ColorType } from 'utils/color'

// Enums
import { Scale, ScaleType } from 'enums/scales'

// Config
import { XYConfig } from './config'

export class XYCore extends ComponentCore {
  config: XYConfig
  xScale = Scale[ScaleType.Linear]()
  yScale = Scale[ScaleType.Linear]()
  colorScale: any

  updateScales () {
    const { config, datamodel: { data } } = this

    this.xScale
      .domain(extent(data, d => getValue(d, config.x)))
      .range([config.padding.left, config.width - config.padding.right])

    this.yScale
      .domain(extent(data, d => getValue(d, config.y)))
      .range([config.height - config.padding.bottom, config.padding.top])
  }

  getColor (d, accessor) {
    const { config } = this
    const value = getValue(d, accessor)
    if (config.colorType === ColorType.Dynamic) return this.colorScale(value)
    else return value
  }
}
