// Copyright (c) Volterra, Inc. All rights reserved.

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { getValue, isNumber, isEmpty } from 'utils/data'
import { getColor } from 'utils/color'

// Types
import { Spacing } from 'types/misc'

// Config
import { ScatterConfig, ScatterConfigInterface } from './config'

// Modules
import { createNodes, updateNodes, removeNodes } from './modules/node'

// Styles
import * as s from './style'

export class Scatter<Datum> extends XYComponentCore<Datum> {
  static selectors = s
  config: ScatterConfig<Datum> = new ScatterConfig()
  events = {
    [Scatter.selectors.point]: {
      mousemove: this._onEvent,
      mouseover: this._onEvent,
      mouseleave: this._onEvent,
    },
  }

  constructor (config?: ScatterConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)
  }

  setConfig (config: ScatterConfigInterface<Datum>): void {
    super.setConfig(config)
    this._updateSizeScale()
  }

  setData (data: Datum[]): void {
    super.setData(data)
    this._updateSizeScale()
  }

  get bleed (): Spacing {
    const maxR = 2 * this._getMaxPointRadius() // We increase the max radius because the D3 Symbol size is not strictly set
    return { top: maxR, bottom: maxR, left: maxR, right: maxR }
  }

  _render (customDuration?: number): void {
    const { config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    const pointGroups = this.g
      .selectAll(`.${s.point}`)
      .data(this._prepareData())

    pointGroups.exit().call(removeNodes, duration)

    const pointGroupsEnter = pointGroups.enter().append('g')
      .attr('class', s.point)
      .call(createNodes)

    const pointGroupsMerged = pointGroupsEnter.merge(pointGroups)
    pointGroupsMerged.call(updateNodes, duration)
  }

  _updateSizeScale (): void {
    const { config, datamodel } = this

    config.sizeScale
      .domain(datamodel.getExtent(config.size))
      .range(config.sizeRange)
  }

  _prepareData (): Record<string, unknown>[] {
    const { config: { size, sizeScale, x, y, scales, shape, icon, color, cursor }, datamodel: { data } } = this

    const maxR = this._getMaxPointRadius()
    const xRange = scales.x.range()

    return data?.reduce((acc, d, i) => {
      const posX = scales.x(getValue(d, x))
      const posY = scales.y(getValue(d, y))
      const pointSize = sizeScale(getValue(d, size))

      if ((posX + pointSize >= (xRange[0] - maxR)) && (posX - pointSize <= (xRange[1] + maxR))) {
        acc.push({
          ...d,
          _screen: {
            x: posX,
            y: posY,
            size: pointSize,
            color: getColor(d, color),
            shape: getValue(d, shape),
            icon: getValue(d, icon),
            cursor: getValue(d, cursor),
          },
        })
      }

      return acc
    }, []) ?? []
  }

  _getMaxPointRadius (): number {
    const { config, datamodel, datamodel: { data } } = this
    if (isEmpty(data)) return 0

    const maxSizeValue = datamodel.getMax(config.size)
    return config.sizeScale(maxSizeValue) / 2
  }
}
