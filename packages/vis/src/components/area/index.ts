// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'
import { area, Area as AreaInterface } from 'd3-shape'
import { interpolatePath } from 'd3-interpolate-path'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { getValue, isNumber, isArray, getStackedExtent, getStackedValues } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
import { Curve } from 'types/curves'
import { NumericAccessor } from 'types/misc'
import { AreaDatum } from 'types/area'

// Config
import { AreaConfig, AreaConfigInterface } from './config'

// Styles
import * as s from './style'

export class Area<Datum> extends XYComponentCore<Datum> {
  static selectors = s
  stacked = true
  config: AreaConfig<Datum> = new AreaConfig()
  areaGen: AreaInterface<AreaDatum>
  events = {
    [Area.selectors.area]: {
    },
  }

  constructor (config?: AreaConfigInterface<Datum>) {
    super()
    if (config) this.config.init(config)
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config, datamodel: { data } } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    const curveGen = Curve[config.curveType]
    this.areaGen = area<AreaDatum>()
      .x(d => d.x)
      .y0(d => d.y0)
      .y1(d => d.y1)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .curve(curveGen)

    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]
    const stackedValues = data.map(d => getStackedValues(d, ...yAccessors))
    const baselineValues = data.map(d => getValue(d, config.baseline) || 0)
    const areaDataX = data.map(d => config.scales.x(getValue(d, config.x)))
    const stackedData: AreaDatum[][] = yAccessors.map(
      (acs, i) => stackedValues.map(
        (d, j) => ({
          y0: config.scales.y(baselineValues[j] + (d[i - 1] ?? 0)),
          y1: config.scales.y(d[i] + baselineValues[j]),
          x: areaDataX[j],
        })
      )
    )

    const areas = this.g
      .selectAll(`.${s.area}`)
      .data(stackedData)

    const areasEnter = areas.enter().append('path')
      .attr('class', s.area)
      .attr('d', d => this.areaGen(d) || this._emptyPath())
      .style('opacity', 0)
      .style('fill', (d, i) => getColor(d, config.color, i))

    const areasMerged = smartTransition(areasEnter.merge(areas), duration)
      .style('opacity', d => {
        const isDefined = d.some(p => (p.y0 - p.y1) !== 0)
        return isDefined ? getValue(d, config.opacity) : 0
      })
      .style('fill', (d, i) => getColor(d, config.color, i))
      .style('cursor', (d, i) => getValue(d, config.cursor, i))

    if (duration) {
      areasMerged
        .attrTween('d', (d, i, el) => {
          const previous = select(el[i]).attr('d')
          const next = this.areaGen(d) || this._emptyPath()
          return interpolatePath(previous, next)
        })
    } else {
      areasMerged.attr('d', d => this.areaGen(d) || this._emptyPath())
    }

    areas.exit().remove()
  }

  getYDataExtent (): number[] {
    const { config, datamodel } = this
    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]

    return getStackedExtent(datamodel.data, config.baseline, ...yAccessors)
  }

  _emptyPath (): string {
    const { config: { scales: { x, y } } } = this
    const xRange = x.range()
    const yDomain = y.domain() as number[]

    const y0 = y((yDomain[0] + yDomain[1]) / 2)
    const y1 = y0

    return this.areaGen([
      { y0, y1, x: xRange[0] },
      { y0, y1, x: xRange[1] },
    ])
  }
}
