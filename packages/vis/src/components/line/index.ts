// Copyright (c) Volterra, Inc. All rights reserved.
import { select } from 'd3-selection'
import { line, Line as LineInterface, CurveFactory } from 'd3-shape'
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
  lineGen: LineInterface<any[]>
  curve: CurveFactory = Curve[CurveType.MonotoneX]
  events = {
    [Line.selectors.line]: {
      mousemove: this._onEvent,
      mouseover: this._onEvent,
      mouseleave: this._onEvent,
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

    this.lineGen = line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(this.curve)

    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]
    const lineDataX = data.map(d => config.scales.x(getValue(d, config.x)))
    const lineData = yAccessors.map(a =>
      data.map((d, i) => ([
        lineDataX[i],
        config.scales.y(getValue(d, a) ?? null),
      ]))
    )

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
      .style('stroke-opacity', (d, i) => (yAccessors[i] && d?.length) ? 1 : 0)

    if (duration) {
      linesMerged
        .attrTween('d', (d, i, el) => {
          const previous = select(el[i]).attr('d')
          const next = this.lineGen(d) || this._emptyPath()
          return interpolatePath(previous, next)
        })
    } else {
      linesMerged.attr('d', d => this.lineGen(d))
    }

    lines.exit().remove()
  }

  _emptyPath (): string {
    const { config: { scales: { x, y } } } = this

    const xRange = x.range()
    const yRange = y.range()
    return `M${xRange[0]},${yRange[0]} L${xRange[1]},${yRange[0]}`
  }
}
