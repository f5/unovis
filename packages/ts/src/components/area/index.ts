import { select } from 'd3-selection'
import { Transition } from 'd3-transition'
import { area, Area as AreaInterface, line, Line as LineInterface } from 'd3-shape'
import { interpolatePath } from 'd3-interpolate-path'

// Core
import { XYComponentCore } from '@/core/xy-component'

// Utils
import { getNumber, getString, isArray, isNumber, getStackedExtent, getStackedData, filterDataByRange, getValue, clamp } from '@/utils/data'
import { smartTransition } from '@/utils/d3'
import { getColor } from '@/utils/color'
import { getPattern, getFillPatternValue, getLinePatternValue, UNOVIS_PATTERN_INDEX_ATTR } from '@/utils/pattern'

// Types
import { Curve, CurveType } from '@/types/curve'
import { NumericAccessor } from '@/types/accessor'
import { Spacing } from '@/types/spacing'
import { Direction } from '@/types/direction'

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
  private _lineGen: LineInterface<AreaDatum>
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

  get bleed (): Spacing {
    const { config: { line, lineWidth } } = this
    if (!line) return { top: 0, bottom: 0, left: 0, right: 0 }

    const yDomain = this.yScale.domain() as [number, number]
    const yDirection = this.yScale.range()[0] > this.yScale.range()[1]
      ? Direction.North
      : Direction.South
    const isYDirectionSouth = yDirection === Direction.South

    const isLineThick = lineWidth > 3
    const isLineVeryThick = lineWidth >= 10
    return {
      top: !isLineVeryThick && (
        (!isYDirectionSouth && (yDomain[1] === 0)) || (isYDirectionSouth && (yDomain[0] === 0))
      ) ? 0 : lineWidth / 2,
      bottom: !isLineVeryThick && (
        (!isYDirectionSouth && (yDomain[0] === 0)) || (isYDirectionSouth && (yDomain[1] === 0))
      ) ? 0 : lineWidth / 2,
      left: isLineThick ? lineWidth / 2 : 0,
      right: isLineThick ? lineWidth / 2 : 0,
    }
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config, datamodel: { data } } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    const colorOptions = { colorFn: this._colorFunction }

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

    // Clamp to the visible y range so the area and its fill stay within the container
    const yRange = this.yScale.range()
    const yRangeMin = Math.min(yRange[0], yRange[1])
    const yRangeMax = Math.max(yRange[0], yRange[1])

    const minHeightCumulativeArray: number[] = []
    const stackedData: AreaDatum[][] = stacked.map(
      arr => arr.map(
        (d, j) => {
          const x = areaDataX[j]
          const y0 = clamp(this.yScale(d[0]), yRangeMin, yRangeMax)
          const y1 = clamp(this.yScale(d[1]), yRangeMin, yRangeMax)
          const isNegativeArea = y1 > y0

          // Only apply cumulative adjustment if `config.stackMinHeight` is true
          const cumulative = config.stackMinHeight ? (minHeightCumulativeArray[j] || 0) : 0
          const adjustedY0 = isNegativeArea ? y0 + cumulative : y0 - cumulative
          const adjustedY1 = isNegativeArea ? y1 + cumulative : y1 - cumulative

          // Calculate height adjustment if needed
          let heightAdjustment = 0
          if ((config.minHeight || config.minHeight1Px) &&
              Math.abs(adjustedY1 - adjustedY0) < (config.minHeight ?? 1)) {
            heightAdjustment = (config.minHeight ?? 1) - Math.abs(adjustedY1 - adjustedY0)

            // Only update cumulative array if we're stacking min heights
            if (config.stackMinHeight) {
              minHeightCumulativeArray[j] = cumulative + heightAdjustment
            }
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
    const stackedDataReversed = [...stackedData].reverse()
    const areas = this.g
      .selectAll<SVGPathElement, AreaDatum>(`.${s.area}`)
      .data(stackedDataReversed)

    const areasEnter = areas.enter().append('path')
      .attr('class', s.area)
      .attr('d', d => this._areaGen(d) || this._emptyPath())
      .attr(UNOVIS_PATTERN_INDEX_ATTR, (d, i) => areaMaxIdx - i)
      .style('opacity', 0)
      .style('fill', (d, i) => getColor(data, config.color, areaMaxIdx - i, config.colorKeys?.[areaMaxIdx - i], colorOptions))
      .style('mask', (d, i) => getFillPatternValue(getPattern(data, config.pattern, areaMaxIdx - i)))

    const areasMerged = smartTransition(areasEnter.merge(areas), duration)
      .style('opacity', (d, i) => {
        const isDefined = d.some(p => (p.y0 - p.y1) !== 0)
        return isDefined ? getNumber(data, config.opacity, areaMaxIdx - i) : 0
      })
      .style('fill', (d, i) => getColor(data, config.color, areaMaxIdx - i, config.colorKeys?.[areaMaxIdx - i], colorOptions))
      .style('mask', (d, i) => getFillPatternValue(getPattern(data, config.pattern, areaMaxIdx - i)))
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

    this._renderLines(duration, config.line ? stackedData : [])
  }

  _renderLines (duration: number, stackedData: AreaDatum[][]): void {
    const { config, datamodel: { data } } = this
    const colorOptions = { colorFn: this._colorFunction }
    const areaMaxIdx = stackedData.length - 1
    const stackedDataReversed = [...stackedData].reverse()
    const colorAccessor = config.lineColor ?? config.color
    const lines = this.g
      .selectAll<SVGPathElement, AreaDatum[]>(`.${s.areaLinePath}`)
      .data(stackedDataReversed)

    const areas = this.g.selectAll(`.${s.area}`).nodes()

    const getLineColor = (i: number): string => getColor(data, colorAccessor, areaMaxIdx - i, config.colorKeys?.[areaMaxIdx - i], colorOptions)
    const getLinePattern = (i: number, el?: SVGPathElement | null): { marker: string | null; dashArray: string | null } | null =>
      getLinePatternValue(getPattern(data, config.linePattern, areaMaxIdx - i), getLineColor(i), el)
    // Explicit `lineDashArray` takes precedence over the resolved pattern's dash array
    const getLineDashArray = (i: number): string | null =>
      getValue<Datum[], number[]>(data, config.lineDashArray, i)?.join(' ') ?? getLinePattern(i)?.dashArray ?? null

    const linesEnter = lines.enter().insert('path', (d, i) => areas[i + 1])
      .attr('class', s.areaLinePath)
      .attr(UNOVIS_PATTERN_INDEX_ATTR, (d, i) => areaMaxIdx - i)
      .attr('stroke', (d, i) => getLineColor(i))
      .attr('stroke-width', config.lineWidth)
      .attr('stroke-opacity', 0)
      .style('marker', function (d, i) { return getLinePattern(i, this)?.marker ?? null })

    const linesMerged = smartTransition(linesEnter.merge(lines), duration)
      .attr('stroke', (d, i) => getLineColor(i))
      .attr('stroke-width', config.lineWidth)
      .attr('stroke-opacity', 1)
      .attr('cursor', (d, i) => getString(data, config.cursor, areaMaxIdx - i))
      .style('marker', (d, i, nodes) => getLinePattern(i, nodes[i])?.marker ?? null)
      .style('stroke-dasharray', (d, i) => getLineDashArray(i))

    const curveGen = Curve[config.curveType as CurveType]
    this._lineGen = line<AreaDatum>()
      .x(d => d.x)
      .y(d => d.y1)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .curve(curveGen)

    if (duration) {
      const lineTransition = linesMerged as Transition<SVGPathElement, AreaDatum[], SVGGElement, AreaDatum[]>
      lineTransition.attrTween('d', (d, i, el) => {
        const previous = select(el[i]).attr('d') || this._emptyLinePath()
        const next = this._lineGen(d) || this._emptyLinePath()
        return interpolatePath(previous, next)
      })
    } else {
      linesMerged.attr('d', d => this._lineGen(d) || this._emptyLinePath())
    }

    smartTransition(lines.exit(), duration)
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

  _emptyLinePath (): string {
    const xRange = this.xScale.range()
    const yRange = this.yScale.range()
    return `M${xRange[0]},${yRange[0]} L${xRange[1]},${yRange[0]}`
  }
}
