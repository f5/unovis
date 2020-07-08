// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'
import { line, Line as LineGenInterface, CurveFactory } from 'd3-shape'
import { interpolatePath } from 'd3-interpolate-path'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { getValue, isNumber, isArray } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
import { Curve, CurveType } from 'types/curves'
import { NumericAccessor, Spacing } from 'types/misc'

// Config
import { LineConfig, LineConfigInterface } from './config'

// Styles
import * as s from './style'

export class Line<Datum> extends XYComponentCore<Datum> {
  static selectors = s
  config: LineConfig<Datum> = new LineConfig()
  lineGen: LineGenInterface<{ x: number; y: number; defined: boolean }>
  curve: CurveFactory = Curve[CurveType.MonotoneX]
  events = {
    [Line.selectors.line]: {
      mouseover: this._highlight.bind(this),
      mouseleave: this._resetHighlight.bind(this),
    },
  }

  constructor (config?: LineConfigInterface<Datum>) {
    super()
    if (config) this.config.init(config)
  }

  get bleed (): Spacing {
    const { config: { lineWidth } } = this
    return { top: lineWidth, bottom: lineWidth, left: lineWidth, right: lineWidth }
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config, datamodel: { data } } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    this.lineGen = line<{ x: number; y: number; defined: boolean }>()
      .x(d => d.x)
      .y(d => d.y)
      .defined(d => d.defined)
      .curve(this.curve)

    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]
    const lineDataX = data.map(d => config.scales.x(getValue(d, config.x)))
    const lineData = yAccessors.map(a => {
      const ld = data.map((d, i) => {
        const value = getValue(d, a) ?? config.noDataValue
        return {
          x: lineDataX[i],
          y: config.scales.y(value),
          defined: isNumber(value),
        }
      })

      return {
        values: ld,
        defined: ld.reduce((def, d) => (d.defined || def), false),
      }
    })

    const lines = this.g
      .selectAll(`.${s.line}`)
      .data(lineData)

    const linesEnter = lines.enter().append('g')
      .attr('class', s.line)

    linesEnter
      .append('path')
      .attr('class', s.linePath)
      .attr('d', this._emptyPath())
      .style('stroke', (d, i) => getColor(d, config.color, i))
      .style('stroke-opacity', 0)

    linesEnter
      .append('path')
      .attr('class', s.lineSelectionHelper)
      .attr('d', this._emptyPath())

    const linesMerged = linesEnter.merge(lines)
    linesMerged.each((d, i, elements) => {
      const group = select(elements[i])
      const linePath = group.select(`.${s.linePath}`)
      const lineSelectionHelper = group.select(`.${s.lineSelectionHelper}`)

      const isLineVisible = yAccessors[i] && d.defined
      const transition = smartTransition(linePath, duration)
        .style('stroke', getColor(d, config.color, i))
        .attr('stroke-width', config.lineWidth)
        .style('stroke-opacity', isLineVisible ? 1 : 0)

      const svgPathD = this.lineGen(d.values) || this._emptyPath()
      if (duration) {
        const previous = linePath.attr('d')
        const next = svgPathD
        transition.attrTween('d', () => interpolatePath(previous, next))
      } else {
        transition.attr('d', svgPathD)
      }

      lineSelectionHelper
        .attr('d', svgPathD)
        .attr('visibility', isLineVisible ? null : 'hidden')
    })

    lines.exit().remove()
  }

  private _emptyPath (): string {
    const { config: { scales: { x, y } } } = this

    const xRange = x.range()
    const yRange = y.range()
    return `M${xRange[0]},${yRange[0]} L${xRange[1]},${yRange[0]}`
  }

  private _raiseSelection (d, i, els): void {
    select(els[i]).raise()
  }

  private _highlight (datum, i, els): void {
    const { config } = this
    this._raiseSelection(datum, i, els)

    if (config.highlightOnHover) {
      this.g
        .selectAll(`.${s.line}`)
        .classed(s.dim, d => d !== datum)
    }
  }

  private _resetHighlight (d, i, els): void {
    const { config } = this

    if (config.highlightOnHover) {
      this.g
        .selectAll(`.${s.line}`)
        .classed(s.dim, false)
    }
  }
}
