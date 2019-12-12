// Copyright (c) Volterra, Inc. All rights reserved.
import { line, Line as LineInterface, CurveFactory } from 'd3-shape'
import { Selection } from 'd3-selection'

// Core
import { XYCore } from 'core/xy-component'

// Utils
import { getValue, isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'

// Enums
import { Curve, CurveType } from 'enums/curves'

// Config
import { LineConfig, LineConfigInterface } from './config'

// Styles
import * as s from './style'

export class Line extends XYCore {
  static selectors = s
  config: LineConfig = new LineConfig()
  lineGen: LineInterface<any[]>
  linePath: Selection<SVGGElement, object[], SVGGElement, object[]>
  curve: CurveFactory = Curve[CurveType.MonotoneX]
  events = {
    [Line.selectors.line]: {
      'mousemove': this._onEvent,
      'mouseover': this._onEvent,
      'mouseleave': this._onEvent,
    },
  }

  constructor (config?: LineConfigInterface) {
    super()
    if (config) this.config.init(config)

    this.linePath = this.g.append('path')
      .attr('class', s.line)
      .style('stroke', d => this.getColor(d, config.color))
  }

  // setData (data: any): void {
  //   super.setData(data)
  // }

  _render (customDuration?: number): void {
    const { config, datamodel: { data } } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    this.updateScales()

    this.lineGen = line()
      .x(d => this.xScale(getValue(d, config.x)))
      .y(d => this.yScale(getValue(d, config.y)))
      .curve(this.curve)

    this.linePath.datum(data)
    smartTransition(this.linePath, duration)
      .attr('d', this.lineGen(data))
      .style('stroke', d => this.getColor(d, config.color))
  }
}
