import { max, min } from 'd3-array'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { isNumber, getExtent, getNumber, getString, isArray, flatten, getValue } from 'utils/data'
import { getColor } from 'utils/color'
import { smartTransition } from 'utils/d3'

// Types
import { Spacing } from 'types/spacing'
import { SymbolType } from 'types/symbol'
import { NumericAccessor } from 'types/accessor'

// Local Types
import { ScatterPoint } from './types'

// Config
import { ScatterConfig, ScatterConfigInterface } from './config'

// Modules
import { createPoints, updatePoints, removePoints } from './modules/point'

// Styles
import * as s from './style'

export class Scatter<Datum> extends XYComponentCore<Datum, ScatterConfig<Datum>, ScatterConfigInterface<Datum>> {
  static selectors = s
  config: ScatterConfig<Datum> = new ScatterConfig()
  events = {
    [Scatter.selectors.point]: {},
  }

  private _pointData: ScatterPoint<Datum>[][] = []

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
    this._pointData = this._getOnScreenData()
    const pointDataFlat: ScatterPoint<Datum>[] = flatten(this._pointData)

    const yRangeStart = min(this.yScale.range())
    const yRangeEnd = max(this.yScale.range())
    const xRangeStart = this.xScale.range()[0]
    const xRangeEnd = this.xScale.range()[1]

    const minY = min(pointDataFlat, d => this.yScale(d._point.yValue) - d._point.sizePx / 2)
    const maxY = max(pointDataFlat, d => this.yScale(d._point.yValue) + d._point.sizePx / 2)
    const minX = min(pointDataFlat, d => this.xScale(d._point.xValue) - d._point.sizePx / 2)
    const maxX = max(pointDataFlat, d => this.xScale(d._point.xValue) + d._point.sizePx / 2)

    const coeff = 1.25 // Multiplier to take into account subsequent scale range changes and shape irregularities
    const top = minY < yRangeStart ? coeff * (yRangeStart - minY) : 0
    const bottom = maxY > yRangeEnd ? coeff * (maxY - yRangeEnd) : 0
    const left = minX < xRangeStart ? coeff * (xRangeStart - minX) : 0
    const right = maxX > xRangeEnd ? coeff * (maxX - xRangeEnd) : 0

    return { top, bottom, left, right }
  }

  _render (customDuration?: number): void {
    const { config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    // Groups
    const pointGroups = this.g
      .selectAll<SVGGElement, ScatterPoint<Datum>[]>(`.${s.pointGroup}`)
      .data(this._pointData)

    const pointGroupsEnter = pointGroups
      .enter()
      .append('g')
      .attr('class', s.pointGroup)

    const pointGroupsMerged = pointGroupsEnter.merge(pointGroups)
    smartTransition(pointGroupsMerged, duration)
      .style('opacity', 1)

    const pointGroupExit = pointGroups.exit().attr('class', s.pointGroupExit)
    smartTransition(pointGroupExit, duration).style('opacity', 0).remove()

    // Points
    const points = pointGroupsMerged
      .selectAll<SVGPathElement, ScatterPoint<Datum>>(`.${s.point}`)
      .data((d) => d, (d, i) => `${getString(d, config.id, i) ?? i}`)

    const pointsEnter = points.enter().append('g')
      .attr('class', s.point)
    createPoints(pointsEnter, this.xScale, this.yScale)

    const pointsMerged = pointsEnter.merge(points)
    updatePoints(pointsMerged, config, this.xScale, this.yScale, duration)

    removePoints(points.exit(), this.xScale, this.yScale, duration)
  }

  private _updateSizeScale (): void {
    const { config, datamodel } = this

    config.sizeScale
      .domain(getExtent(datamodel.data, config.size))
      .range(config.sizeRange ?? [0, 0])
  }

  private _getOnScreenData (): ScatterPoint<Datum>[][] {
    const { config, datamodel: { data } } = this

    const xDomain = this.xScale.domain().map(d => +d) // Convert Date to number
    const yDomain = this.yScale.domain().map(d => +d) // Convert Date to number
    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]

    const maxSizeValue = max<number>(flatten(yAccessors.map((y, j) => data?.map(d => getNumber(d, config.size, j)))))
    const maxSizePx = config.sizeRange ? config.sizeScale(maxSizeValue) : maxSizeValue
    const maxSizeXDomain = (this.xScale.invert(maxSizePx) as number) - (this.xScale.invert(0) as number)
    const maxSizeYDomain = Math.abs((this.yScale.invert(maxSizePx) as number) - (this.yScale.invert(0) as number))

    return yAccessors.map((y, j) => {
      return data?.reduce<ScatterPoint<Datum>[]>((acc, d, i) => {
        const xValue = getNumber(d, config.x, i)
        const yValue = getNumber(d, y, j)
        const pointSize = getNumber(d, config.size, i)
        const pointSizeScaled = config.sizeRange ? config.sizeScale(pointSize) : pointSize
        const pointSizeXDomain = (this.xScale.invert(pointSizeScaled) as number) - (this.xScale.invert(0) as number)
        const pointSizeYDomain = Math.abs((this.yScale.invert(pointSizeScaled) as number) - (this.yScale.invert(0) as number))

        if (
          ((xValue - pointSizeXDomain / 2) >= (xDomain[0] - maxSizeXDomain / 2)) &&
          ((xValue + pointSizeXDomain / 2) <= (xDomain[1] + maxSizeXDomain / 2)) &&
          ((yValue - pointSizeYDomain / 2) >= (yDomain[0] - maxSizeYDomain / 2)) &&
          ((yValue + pointSizeYDomain / 2) <= (yDomain[1] + maxSizeYDomain / 2))
        ) {
          acc.push({
            ...d,
            _point: {
              xValue: xValue,
              yValue: yValue,
              sizePx: pointSizeScaled,
              color: getColor(d, config.color, j),
              shape: getString(d, config.shape, j) as SymbolType,
              label: getString(d, config.label, j),
              labelColor: getValue(d, config.labelColor, j),
              cursor: getString(d, config.cursor, j),
            },
          })
        }

        return acc
      }, []) ?? []
    })
  }
}
