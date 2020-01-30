// Copyright (c) Volterra, Inc. All rights reserved.
import { line, Line as LineInterface, CurveFactory } from 'd3-shape'

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
        config.scales.y(getValue(d, a)),
      ]))
    )

    const lines = this.g
      .selectAll(`.${s.line}`)
      .data(lineData)

    const linesEnter = lines.enter().append('path')
      .attr('class', s.line)
      .style('stroke', (d, i) => getColor(d, config.color, i))

    smartTransition(linesEnter.merge(lines), duration)
      .attr('d', d => this.lineGen(d))
      .style('stroke', (d, i) => getColor(d, config.color, i))
      .attr('stroke-width', config.lineWidth)

    lines.exit().remove()
  }
}
