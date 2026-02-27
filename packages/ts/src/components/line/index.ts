import { select } from 'd3-selection'
import { Transition } from 'd3-transition'
import { CurveFactoryLineOnly, Line as LineGenInterface, line } from 'd3-shape'
import { interpolatePath } from 'd3-interpolate-path'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { getNumber, getString, getValue, isArray, isNumber, getStackedData, getStackedExtent, filterDataByRange } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
import { NumericAccessor } from 'types/accessor'
import { Spacing } from 'types/spacing'
import { Curve, CurveType } from 'types/curve'
import { Direction } from 'types/direction'

// Local Types
import { LineData, LineDatum } from './types'

// Config
import { LineDefaultConfig, LineConfigInterface } from './config'

// Styles
import * as s from './style'

export class Line<Datum> extends XYComponentCore<Datum, LineConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = LineDefaultConfig as LineConfigInterface<Datum>
  public config: LineConfigInterface<Datum> = this._defaultConfig
  lineGen: LineGenInterface<{ x: number; y: number; defined: boolean }>
  curve: CurveFactoryLineOnly = Curve[CurveType.MonotoneX]
  events = {
    [Line.selectors.line]: {
      mouseover: this._highlight.bind(this),
      mouseleave: this._resetHighlight.bind(this),
    },
  }

  constructor (config?: LineConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)
    this.stacked = config?.stacked ?? false
  }

  get bleed (): Spacing {
    const { config: { lineWidth } } = this
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

    this.curve = Curve[config.curveType]
    this.lineGen = line<{ x: number; y: number; defined: boolean }>()
      .x(d => d.x)
      .y(d => d.y)
      .defined(d => d.defined)
      .curve(this.curve)

    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]
    const lineDataX = data.map((d, i) => this.xScale(getNumber(d, config.x, i)))
    const stackedData = config.stacked ? getStackedData(data, 0, yAccessors) : undefined
    const lineData: LineData[] = yAccessors.map((a, seriesIndex) => {
      const ld: LineDatum[] = data.map((d, i) => {
        const rawValue = getNumber(d, a, i)

        // If `rawValue` is not numerical or if it's not finite (`NaN`, `undefined`, ...), we replace it with `config.fallbackValue`
        const value = (isNumber(rawValue) || (rawValue === null)) && isFinite(rawValue) ? rawValue : config.fallbackValue
        const yValue = config.stacked ? stackedData[seriesIndex][i][1] : (value ?? 0)
        const defined = config.interpolateMissingData
          ? (isNumber(rawValue) || (rawValue === null)) && isFinite(rawValue)
          : isFinite(value)

        return {
          x: lineDataX[i],
          y: this.yScale(yValue),
          defined,
          value,
        }
      })
      const defined = ld.reduce((def, d) => (d.defined || def), false)

      let validGap = false
      const gaps = ld.reduce((acc, d, i) => {
        // Gaps include fallback values if configured.
        if (!d.defined && isFinite(config.fallbackValue)) {
          acc.push({ ...d, defined: true })
        }

        if (!d.defined && !validGap) validGap = true

        const isEndpoint = (i > 0 && !ld[i - 1].defined) || (i < ld.length - 1 && !ld[i + 1].defined)
        if (d.defined && isEndpoint) {
          // If no undefined points have been found since the last endpoint, we insert one to enforce breaks between adjacent gaps.
          if (!validGap) acc.push({ ...d, defined: false })
          acc.push(d)
          validGap = false
        }
        return acc
      }, [])

      // If the line consists only of `null` values, we'll still render it but it'll be invisible.
      // Such trick allows us to have better animated transitions.
      const visible = defined && ld.some(d => d.value !== null)
      return {
        values: ld,
        defined,
        gaps,
        visible,
      }
    })

    const lines = this.g
      .selectAll<SVGGElement, LineData>(`.${s.line}`)
      .data(lineData)

    const linesEnter = lines.enter().append('g')
      .attr('class', s.line)

    linesEnter
      .append('path')
      .attr('class', s.linePath)
      .attr('stroke', (d, i) => getColor(data, config.color, i))
      .attr('stroke-opacity', 0)
      .attr('stroke-width', config.lineWidth)

    linesEnter
      .append('path')
      .attr('class', s.lineSelectionHelper)
      .attr('d', this._emptyPath())

    linesEnter.append('path')
      .attr('class', s.interpolatedPath)
      .attr('d', this._emptyPath())
      .style('opacity', 0)

    const linesMerged = linesEnter.merge(lines)
    linesMerged.style('cursor', (d, i) => getString(data, config.cursor, i))
    linesMerged.each((d, i, elements) => {
      const group = select(elements[i])
      const linePath = group.select<SVGPathElement>(`.${s.linePath}`)
      const lineSelectionHelper = group.select(`.${s.lineSelectionHelper}`)
      const lineGaps = group.select(`.${s.interpolatedPath}`)

      const isLineVisible = d.visible
      const dashArray = getValue<Datum[], number[]>(data, config.lineDashArray, i)
      const transition = smartTransition(linePath, duration)
        .attr('stroke', getColor(data, config.color, i))
        .attr('stroke-width', config.lineWidth)
        .attr('stroke-opacity', isLineVisible ? 1 : 0)
        .style('stroke-dasharray', dashArray?.join(' ') ?? null) // We use `.style` because there's also a default CSS-variable for stroke-dasharray

      const hasUndefinedSegments = d.values.some(d => !d.defined)
      const svgPathD = this.lineGen(d.values)

      if (duration && !hasUndefinedSegments) {
        const previous = linePath.attr('d') || this._emptyPath()
        const next = svgPathD || this._emptyPath()
        const t = transition as Transition<SVGPathElement, LineData, SVGGElement, LineData>
        t.attrTween('d', () => interpolatePath(previous, next))
      } else if (d.visible) {
        transition.attr('d', svgPathD)
      }

      lineSelectionHelper
        .attr('d', svgPathD)
        .attr('visibility', isLineVisible ? null : 'hidden')

      if (hasUndefinedSegments && config.interpolateMissingData) {
        smartTransition(lineGaps, duration)
          .attr('d', this.lineGen(d.gaps))
          .attr('stroke', getColor(data, config.color, i))
          .attr('stroke-width', config.lineWidth - 1)
          .style('opacity', 1)
      } else {
        lineGaps.transition()
          .duration(duration)
          .style('opacity', 0)
      }
    })

    smartTransition(lines.exit(), duration)
      .style('opacity', 0)
      .remove()
  }

  getYDataExtent (scaleByVisibleData: boolean): number[] {
    const { config, datamodel } = this
    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]

    if (config.stacked) {
      const xDomain = this.xScale.domain() as [number, number]
      const data = scaleByVisibleData ? filterDataByRange(datamodel.data, xDomain, config.x, true) : datamodel.data
      return getStackedExtent(data, ...yAccessors)
    }

    return super.getYDataExtent(scaleByVisibleData)
  }

  private _emptyPath (): string {
    const xRange = this.xScale.range()
    const yRange = this.yScale.range()
    return `M${xRange[0]},${yRange[0]} L${xRange[1]},${yRange[0]}`
  }

  private _highlight (datum: Datum): void {
    const { config } = this

    if (config.highlightOnHover) {
      this.g
        .selectAll(`.${s.line}`)
        .classed(s.dim, d => d !== datum)
    }
  }

  private _resetHighlight (): void {
    const { config } = this

    if (config.highlightOnHover) {
      this.g
        .selectAll(`.${s.line}`)
        .classed(s.dim, false)
    }
  }
}
