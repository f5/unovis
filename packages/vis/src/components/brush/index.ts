// Copyright (c) Volterra, Inc. All rights reserved.
import { BrushBehavior, brushX } from 'd3-brush'
import { Selection, event } from 'd3-selection'

// Core
import { XYCore } from 'core/xy-component'

// Utils
import { getValue, isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'

// Enums
import { Curve, CurveType } from 'enums/curves'

// Config
import { BrushConfig, BrushConfigInterface } from './config'

// Styles
import * as s from './style'

export class Brush extends XYCore {
  static selectors = s
  config: BrushConfig = new BrushConfig()
  brush: Selection<SVGGElement, object[], SVGGElement, object[]>
  brushBehaviour: BrushBehavior<any> = brushX()
  events = {
    [Brush.selectors.brush]: {
    },
  }

  constructor (config?: BrushConfigInterface) {
    super()
    if (config) this.config.init(config)

    this.brush = this.g
      .attr('class', s.brush)
  }

  // setData (data: any): void {
  //   super.setData(data)
  // }

  _render (customDuration?: number): void {
    const { brushBehaviour, config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    const xScale = config.scales.x

    brushBehaviour
      .extent([[0, 0], [config.width, config.height]])
      .on('brush end', () => { this._onBrush() })

    this.brush
      .call(brushBehaviour)

    const brushRange = config.selection ? [xScale(config.selection[0]), xScale(config.selection[1])] : xScale.range()
    smartTransition(this.brush, duration)
      .call(brushBehaviour.move, brushRange)
  }

  _onBrush (): void {
    const { config } = this
    const xScale = config.scales.x
    const s = event?.selection || xScale.range()
    const selectedDomain = s.map(xScale.invert, xScale)

    config.selection = selectedDomain
    config.onBrush(selectedDomain, event)
  }
}
