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
import { AreaDatum } from 'types/area'

// Config
import { AreaConfig, AreaConfigInterface } from './config'

// Styles
import * as s from './style'

export class Area<Datum> extends XYComponentCore<Datum> {
  static selectors = s
  config: AreaConfig<Datum> = new AreaConfig()
  areaGen: AreaInterface<AreaDatum>
  events = {
    [Area.selectors.area]: {},
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
      .x(d => config.scales.x(d[2]))
      .y0(d => config.scales.y(d[0]))
      .y1(d => config.scales.y(d[1]))
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      .curve(curveGen)

    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]
    const stackGen = stack<any, Datum, NumericAccessor<Datum>>()
      .offset((series, order) => {
        for (let i = 0; i < order.length; i += 1) {
          const prevSeries = series[i - 1]
          const currentSeries = series[i]
          for (let j = 0; j < currentSeries.length; j += 1) {
            const dPrev = prevSeries ? prevSeries[j] : [0, 0]
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            const d = currentSeries[j].data
            const baselineValue = (config.baseline && i === 0) ? getValue(d, config.baseline) : 0
            const value = currentSeries[j][1]
            currentSeries[j][0] = dPrev[1] + baselineValue
            currentSeries[j][1] = dPrev[1] + baselineValue + value
            currentSeries[j][2] = getValue(d, config.x)
          }
        }
      })
      .keys(yAccessors)
      .value((d, acs) => {
        return getValue(d, acs)
      })

    const stackedData: AreaDatum[] = stackGen(data) as any

    const areas = this.g
      .selectAll(`.${s.area}`)
      .data(stackedData)

    const areasEnter = areas.enter().append('path')
      .attr('class', s.area)
      .attr('d', d => this.areaGen(d) || this._emptyPath())
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

    return datamodel.getStackedExtent(config.baseline, ...yAccessors)
  }

  _emptyPath (): string {
    const { config: { scales: { x, y } } } = this
    const xDomain = x.domain() as number[]
    const yDomain = y.domain() as number[]

    const y0 = (yDomain[0] + yDomain[1]) / 2
    const y1 = y0

    return this.areaGen([
      [y0, y1, xDomain[0]],
      [y0, y1, xDomain[1]],
    ])
  }
}
