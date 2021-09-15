// Copyright (c) Volterra, Inc. All rights reserved.

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { isNumber, isEmpty, getExtent, getMax, getNumber, getString } from 'utils/data'
import { getColor } from 'utils/color'

// Types
import { Spacing } from 'types/spacing'
import { SymbolType } from 'types/symbol'
import { GenericDataRecord } from 'types/data'

// Local Types
import { ScatterPoint } from './types'

// Config
import { ScatterConfig, ScatterConfigInterface } from './config'

// Modules
import { createNodes, updateNodes, removeNodes } from './modules/node'

// Styles
import * as s from './style'

export class Scatter<Datum = GenericDataRecord> extends XYComponentCore<Datum> {
  static selectors = s
  config: ScatterConfig<Datum> = new ScatterConfig()
  events = {
    [Scatter.selectors.point]: {},
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
      .selectAll<SVGGElement, Datum>(`.${s.point}`)
      .data(this._getOnScreenData())

    pointGroups.exit().call(removeNodes, duration)

    const pointGroupsEnter = pointGroups.enter().append('g')
      .attr('class', s.point)
      .call(createNodes)

    const pointGroupsMerged = pointGroupsEnter.merge(pointGroups)
    pointGroupsMerged.call(updateNodes, config, duration)
  }

  private _updateSizeScale (): void {
    const { config, datamodel } = this

    config.sizeScale
      .domain(getExtent(datamodel.data, config.size))
      .range(config.sizeRange)
  }

  private _getOnScreenData (): ScatterPoint<Datum>[] {
    const { config: { size, sizeScale, x, y, xScale, yScale, shape, label, labelColor, color, cursor }, datamodel: { data } } = this

    const maxR = this._getMaxPointRadius()
    const xRange = xScale.range()

    return data?.reduce<ScatterPoint<Datum>[]>((acc, d) => {
      const posX = xScale(getNumber(d, x))
      const posY = yScale(getNumber(d, y))
      const pointSize = sizeScale(getNumber(d, size))

      if ((posX + pointSize >= (xRange[0] - maxR)) && (posX - pointSize <= (xRange[1] + maxR))) {
        acc.push({
          ...d,
          _screen: {
            x: posX,
            y: posY,
            size: pointSize,
            color: getColor(d, color),
            shape: getString(d, shape) as SymbolType,
            label: getString(d, label),
            labelColor: getColor(d, labelColor),
            cursor: getString(d, cursor),
          },
        })
      }

      return acc
    }, []) ?? []
  }

  private _getMaxPointRadius (): number {
    const { config, datamodel } = this
    if (isEmpty(datamodel.data)) return 0

    const maxSizeValue = getMax(datamodel.data, config.size)
    return config.sizeScale(maxSizeValue) / 2
  }
}
