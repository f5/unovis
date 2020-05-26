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
      mouseover: this._raiseSelection,
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

    const linesEnter = lines.enter().append('path')
      .attr('class', s.line)
      .attr('d', this._emptyPath())
      .style('stroke', (d, i) => getColor(d, config.color, i))
      .style('stroke-opacity', 0)

    const linesMerged = smartTransition(linesEnter.merge(lines), duration)
      .style('stroke', (d, i) => getColor(d, config.color, i))
      .attr('stroke-width', config.lineWidth)
      .style('stroke-opacity', (d, i) => (yAccessors[i] && d.defined) ? 1 : 0)

    if (duration) {
      linesMerged
        .attrTween('d', (d, i, el) => {
          const previous = select(el[i]).attr('d')
          const path = this.lineGen(d.values)
          const next = path || this._emptyPath()
          return interpolatePath(previous, next)
        })
    } else {
      linesMerged.attr('d', d => this.lineGen(d.values) || this._emptyPath())
    }

    lines.exit().remove()
  }

  _emptyPath (): string {
    const { config: { scales: { x, y } } } = this

    const xRange = x.range()
    const yRange = y.range()
    return `M${xRange[0]},${yRange[0]} L${xRange[1]},${yRange[0]}`
  }

  _raiseSelection (d, i, els): void {
    select(els[i]).raise()
  }
}
