// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'
import { area, Area as AreaInterface, stack } from 'd3-shape'
import { interpolatePath } from 'd3-interpolate-path'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { getValue, isNumber, isArray } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
import { Curve } from 'types/curves'
import { NumericAccessor } from 'types/misc'

// Config
import { AreaConfig, AreaConfigInterface } from './config'

// Styles
import * as s from './style'

export class Area<Datum> extends XYComponentCore<Datum> {
  static selectors = s
  config: AreaConfig<Datum> = new AreaConfig()
  areaGen: AreaInterface<any[]>
  events = {
    [Area.selectors.area]: {
      mousemove: this._onEvent,
      mouseover: this._onEvent,
      mouseleave: this._onEvent,
    },
  }

  constructor (config?: AreaConfigInterface<Datum>) {
    super()
    if (config) this.config.init(config)
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config, datamodel } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    this.areaGen = area()
      .x(d => config.scales.x(d.data.x))
      .y0(d => config.scales.y(d[0]))
      .y1(d => config.scales.y(d[1]))
      .curve(Curve[config.curveType])

    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]
    const stackGen = stack()
      .offset((series, order) => {
        for (let i = 0; i < order.length; i += 1) {
          const dataPrev = series[i - 1]
          const data = series[i]
          for (let j = 0; j < data.length; j += 1) {
            const dPrev = dataPrev ? dataPrev[j] : [0, 0]
            const d = data[j]
            const baselineValue = (config.baseline && i === 0) ? getValue(d.data, config.baseline) : 0
            const value = d[1]
            d[0] = dPrev[1] + baselineValue
            d[1] = dPrev[1] + baselineValue + value
          }
        }
      })
      .keys(yAccessors)
      .value((d, key) => {
        return getValue(d, key)
      })

    const stackedData = stackGen(datamodel.data)
    const areas = this.g
      .selectAll(`.${s.area}`)
      .data(stackedData)

    const areasEnter = areas.enter().append('path')
      .attr('class', s.area)
      .attr('d', this._emptyPath())
      .style('opacity', 0)
      .style('fill', (d, i) => getColor(d, config.color, i))
    const areasMerged = smartTransition(areasEnter.merge(areas), duration)
      .style('opacity', 1)
      .style('fill', (d, i) => getColor(d, config.color, i))

    if (duration) {
      areasMerged
        .attrTween('d', (d, i, el) => {
          const previous = select(el[i]).attr('d')
          const next = this.areaGen(d) || this._emptyPath()
          return interpolatePath(previous, next)
        })
    } else {
      areasMerged.attr('d', d => this.areaGen(d))
    }

    areas.exit().remove()
  }

  getYDataExtent (): number[] {
    const { config, datamodel } = this
    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]
    return datamodel.getAreaStackedExtent(config.baseline ? [config.baseline, ...yAccessors] : yAccessors)
  }

  _emptyPath (): string {
    const { config: { scales: { x, y } } } = this
    const xRange = x.range()
    const yRange = y.range()
    const middleX = (xRange[1] + xRange[0]) * 0.5
    const middleY = (yRange[1] + yRange[0]) * 0.5
    return `M${middleX},${middleY} L${middleX},${middleY}`
  }
}
