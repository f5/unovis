// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'
import { Transition } from 'd3-transition'
import { area, Area as AreaInterface } from 'd3-shape'
import { interpolatePath } from 'd3-interpolate-path'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { getNumber, getString, isArray, isNumber, getStackedExtent, getStackedData, filterDataByRange } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
import { Curve } from 'types/curve'
import { NumericAccessor } from 'types/accessor'

// Local Types
import { AreaDatum } from './types'

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
      .y1(d => {
        const isSmallerThanPixel = Math.abs(d.y1 - d.y0) < 1
        return d.y1 - (isSmallerThanPixel ? 1 : 0)
      })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .curve(curveGen)

    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]
    const areaDataX = data.map(d => config.scales.x(getNumber(d, config.x)))

    const stacked = getStackedData(data, config.baseline, ...yAccessors)
    const stackedData: AreaDatum[][] = stacked.map(
      arr => arr.map(
        (d, j) => ({
          y0: config.scales.y(d[0]),
          y1: config.scales.y(d[1]),
          x: areaDataX[j],
        })
      )
    )

    // We reverse the data in order to have the first areas to be displayed on top
    //   for better visibility when they're close to zero
    const areaMaxIdx = stackedData.length - 1
    const stackedDataReversed = stackedData.reverse()
    const areas = this.g
      .selectAll<SVGPathElement, AreaDatum>(`.${s.area}`)
      .data(stackedDataReversed)

    const areasEnter = areas.enter().append('path')
      .attr('class', s.area)
      .attr('d', d => this.areaGen(d) || this._emptyPath())
      .style('opacity', 0)
      .style('fill', (d, i) => getColor(data, config.color, areaMaxIdx - i))

    const areasMerged = smartTransition(areasEnter.merge(areas), duration)
      .style('opacity', d => {
        const isDefined = d.some(p => (p.y0 - p.y1) !== 0)
        return isDefined ? getNumber(d, config.opacity) : 0
      })
      .style('fill', (d, i) => getColor(data, config.color, areaMaxIdx - i))
      .style('stroke', (d, i) => getColor(data, config.color, areaMaxIdx - i))
      .style('cursor', (d, i) => getString(data, config.cursor, areaMaxIdx - i))

    if (duration) {
      const transition = areasMerged as Transition<SVGPathElement, AreaDatum[], SVGGElement, AreaDatum[]>
      transition.attrTween('d', (d, i, el) => {
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

    const data = config.scaleByDomain ? filterDataByRange(datamodel.data, config.scales.x.domain() as [number, number], config.x) : datamodel.data
    return getStackedExtent(data, config.baseline, ...yAccessors)
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
