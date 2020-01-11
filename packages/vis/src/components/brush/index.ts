// Copyright (c) Volterra, Inc. All rights reserved.
import { BrushBehavior, brushX } from 'd3-brush'
import { Selection, event } from 'd3-selection'

// Core
import { XYCore } from 'core/xy-component'

// Utils
import { isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'

// Enums
import { Direction } from 'enums/direction'

// Config
import { BrushConfig, BrushConfigInterface } from './config'

// Styles
import * as s from './style'

export class Brush extends XYCore {
  static selectors = s
  config: BrushConfig = new BrushConfig()
  brush: Selection<SVGGElement, any, SVGGElement, any>
  unselectedRange: Selection<SVGGElement, any, SVGGElement, any>
  handleLines: Selection<SVGGElement, any, SVGGElement, any>
  brushBehaviour: BrushBehavior<any> = brushX()
  events = {
    [Brush.selectors.brush]: {
    },
  }

  constructor (config?: BrushConfigInterface) {
    super()
    if (config) this.config.init(config)

    this.brush = this.g
      .append('g')
      .attr('class', s.brush)

    const directions = [{ type: 'w' }, { type: 'e' }]
    this.unselectedRange = this.g.selectAll(`.${s.unselected}`)
      .data(directions)
      .enter().append('rect')
      .attr('class', s.unselected)

    this.handleLines = this.g.selectAll(`.${s.handleLine}`)
      .data(directions)
      .enter().append('line')
      .attr('class', s.handleLine)
  }

  // setData (data: any): void {
  //   super.setData(data)
  // }

  _render (customDuration?: number): void {
    const { brushBehaviour, config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    const xScale = config.scales.x
    const yScale = config.scales.y

    brushBehaviour
      .extent([[0, 0], [config.width, config.height]])
      .on('start', () => { this._onBrushStart() })
      .on('brush', () => { this._onBrushMove() })
      .on('end', () => { this._onBrushEnd() })

    this.brush
      .call(brushBehaviour)

    const yRange = yScale.range()
    const h = yRange[0] - yRange[1]

    this.unselectedRange
      .attr('y', yRange[1])
      .attr('height', h)

    this.handleLines
      .attr('y1', yRange[1] + h / 2 - 10)
      .attr('y2', yRange[1] + h / 2 + 10)

    const brushRange = config.selection ? [xScale(config.selection[0]), xScale(config.selection[1])] : null // xScale.range()
    smartTransition(this.brush, duration)
      .call(brushBehaviour.move, brushRange)
  }

  _updateSelection (s: number[]): void {
    const { config } = this
    const xScale = config.scales.x
    const xRange = xScale.range()
    this.unselectedRange
      .attr('x', d => d.type === Direction.WEST ? xRange[0] : s[1])
      .attr('width', d => {
        const length = d.type === Direction.WEST ? s[0] - xRange[0] : xRange[1] - s[1]
        return length > 0 ? length : 0
      })

    this.handleLines
      .attr('transform', d =>
        `translate(${(d as any).type === Direction.WEST
          ? s[0] - config.handleWidth / 2
          : s[1] + config.handleWidth / 2},0)`
      )

    this.brush.selectAll('.handle')
      .attr('x', d => (d as any).type === Direction.WEST ? s[0] - config.handleWidth : s[1])
      .attr('width', config.handleWidth)
  }

  _onBrushStart (): void {
    const { config } = this

    config.onBrushStart(config.selection, event)
  }

  _onBrushMove (): void {
    const { config } = this
    const xScale = config.scales.x
    const s = event?.selection || xScale.range()
    const selectedDomain = s.map(xScale.invert, xScale)

    this._updateSelection(s)
    config.selection = selectedDomain
    config.onBrushMove(selectedDomain, event)
  }

  _onBrushEnd (): void {
    const { config } = this

    config.onBrushEnd(config.selection, event)
  }
}
