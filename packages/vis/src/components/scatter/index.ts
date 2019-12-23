// Copyright (c) Volterra, Inc. All rights reserved.

// Core
import { XYCore } from 'core/xy-component'
import { getCSSVarName } from 'styles/colors'

// Utils
import { getValue, isNumber, isEmpty } from 'utils/data'

// Enums

// Config
import { ScatterConfig, ScatterConfigInterface } from './config'

// Modules
import { createNodes, updateNodes, removeNodes } from './modules/node'

// Styles
import * as s from './style'

export class Scatter extends XYCore {
  static selectors = s
  config: ScatterConfig = new ScatterConfig()
  events = {
    [Scatter.selectors.point]: {
      mousemove: this._onEvent,
      mouseover: this._onEvent,
      mouseleave: this._onEvent,
    },
  }

  constructor (config?: ScatterConfigInterface) {
    super()
    if (config) this.config.init(config)
  }

  // setData (data: any): void {
  //   super.setData(data)
  // }

  get bleed (): { top: number; bottom: number; left: number; right: number } {
    const maxR = this._getMaxPointRadius()
    return { top: maxR, bottom: maxR, left: maxR, right: maxR }
  }

  _render (customDuration?: number): void {
    const { config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    const pointGroups = this.g
      .selectAll(`.${s.point}`)
      .data(this._prepareData())

    pointGroups.exit().call(removeNodes)

    const pointGroupsEnter = pointGroups.enter().append('g')
      .attr('class', s.point)
      .call(createNodes)

    const pointGroupsMerged = pointGroupsEnter.merge(pointGroups)
    pointGroupsMerged.call(updateNodes, duration)
  }

  _prepareData () {
    const { config: { size, x, y, scales, shape, icon, color }, datamodel: { data } } = this
    const scatterPoints = []
    const maxR = this._getMaxPointRadius()

    data?.forEach((d, i) => {
      const pointX = scales.x(getValue(d, x))
      const pointY = scales.y(getValue(d, y))
      const xRange = scales.x.range()
      const pointSize = getValue(d, size)
      if (pointX + pointSize >= (xRange[0] - maxR) && pointX - pointSize <= (xRange[1] + maxR)) {
        const obj = {
          x: pointX,
          y: pointY,
          size: pointSize,
          color: this.getColor(d, color) || `var(${getCSSVarName(i)})`,
          shape: getValue(d, shape),
          icon: getValue(d, icon),
        }
        scatterPoints.push(obj)
      }
    })

    return scatterPoints
  }

  _getMaxPointRadius (): number {
    const { datamodel: { data } } = this
    if (isEmpty(data)) return 0
    return Math.sqrt(this.getSizeDataMax() / 2)
  }

  getSizeDataMax (): number {
    const { config, datamodel } = this
    return datamodel.getMax(config.size)
  }
}
