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
import { Curve, CurveType } from 'types/curve'
import { NumericAccessor } from 'types/accessor'

// Local Types
import { AreaDatum } from './types'

// Config
import { AreaDefaultConfig, AreaConfigInterface } from './config'

// Styles
import * as s from './style'

export class Area<Datum> extends XYComponentCore<Datum, AreaConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = AreaDefaultConfig as AreaConfigInterface<Datum>
  public config: AreaConfigInterface<Datum> = this._defaultConfig
  public stacked = true
  private _areaGen: AreaInterface<AreaDatum>
  private _prevNegative: boolean[] | undefined // To help guessing the stack direction when an accessor was set to null or 0

  events = {
    [Area.selectors.area]: {},
  }

  constructor (config?: AreaConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)

    // Determine if the provided chart should be stacked
    this.stacked = Array.isArray(this.config.y)
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config, datamodel: { data } } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    const curveGen = Curve[config.curveType as CurveType]
    this._areaGen = area<AreaDatum>()
      .x(d => d.x)
      .y0(d => d.y0)
      .y1(d => d.y1)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .curve(curveGen)

    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]
    const areaDataX = data.map((d, i) => this.xScale(getNumber(d, config.x, i)))

    const stacked = getStackedData(data, config.baseline, yAccessors, this._prevNegative)
    this._prevNegative = stacked.map(s => !!s.isMostlyNegative)
    const minHeightCumulativeArray: number[] = []
    const stackedData: AreaDatum[][] = stacked.map(
      arr => arr.map(
        (d, j) => {
          const x = areaDataX[j]
          const y0 = this.yScale(d[0])
          const y1 = this.yScale(d[1])
          const isNegativeArea = y1 > y0

          // Get cumulative adjustment and apply in the correct direction
          const cumulative = minHeightCumulativeArray[j] || 0
          const adjustedY0 = isNegativeArea ? y0 + cumulative : y0 - cumulative
          const adjustedY1 = isNegativeArea ? y1 + cumulative : y1 - cumulative

          // Calculate height adjustment if needed
          let heightAdjustment = 0
          if ((config.minHeight || config.minHeight1Px) &&
              Math.abs(adjustedY1 - adjustedY0) < (config.minHeight ?? 1)) {
            heightAdjustment = (config.minHeight ?? 1) - Math.abs(adjustedY1 - adjustedY0)
            minHeightCumulativeArray[j] = cumulative + heightAdjustment
          }

          return {
            x,
            y0: adjustedY0,
            y1: isNegativeArea ? adjustedY1 + heightAdjustment : adjustedY1 - heightAdjustment,
          }
        }
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
      .attr('d', d => this._areaGen(d) || this._emptyPath())
      .style('opacity', 0)
      .style('fill', (d, i) => getColor(data, config.color, areaMaxIdx - i))

    const areasMerged = smartTransition(areasEnter.merge(areas), duration)
      .style('opacity', (d, i) => {
        const isDefined = d.some(p => (p.y0 - p.y1) !== 0)
        return isDefined ? getNumber(data, config.opacity, areaMaxIdx - i) : 0
      })
      .style('fill', (d, i) => getColor(data, config.color, areaMaxIdx - i))
      .style('cursor', (d, i) => getString(data, config.cursor, areaMaxIdx - i))

    if (duration) {
      const transition = areasMerged as Transition<SVGPathElement, AreaDatum[], SVGGElement, AreaDatum[]>
      transition.attrTween('d', (d, i, el) => {
        const previous = select(el[i]).attr('d')
        const next = this._areaGen(d) || this._emptyPath()
        return interpolatePath(previous, next)
      })
    } else {
      areasMerged.attr('d', d => this._areaGen(d) || this._emptyPath())
    }

    smartTransition(areas.exit(), duration)
      .style('opacity', 0)
      .remove()
  }

  getYDataExtent (scaleByVisibleData: boolean): number[] {
    const { config, datamodel } = this
    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]

    const xDomain = this.xScale.domain() as [number, number]
    const data = scaleByVisibleData ? filterDataByRange(datamodel.data, xDomain, config.x, true) : datamodel.data
    return getStackedExtent(data, config.baseline, ...yAccessors)
  }

  _emptyPath (): string {
    const xRange = this.xScale.range()
    const yDomain = this.yScale.domain() as number[]

    const y0 = this.yScale((yDomain[0] + yDomain[1]) / 2)
    const y1 = y0

    return this._areaGen([
      { y0, y1, x: xRange[0] },
      { y0, y1, x: xRange[1] },
    ])
  }
}
