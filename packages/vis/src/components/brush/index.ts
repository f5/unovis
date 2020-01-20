// Copyright (c) Volterra, Inc. All rights reserved.
import { BrushBehavior, brushX } from 'd3-brush'
import { Selection, event } from 'd3-selection'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'

// Types
import { Direction } from 'types/direction'
import { AxisType } from 'types/axis'

// Config
import { BrushConfig, BrushConfigInterface } from './config'

// Styles
import * as s from './style'

export class Brush<Data> extends XYComponentCore<Data> {
  static selectors = s
  clippable = false // Don't apply clipping path to this component. See XYContainer
  config: BrushConfig<Data> = new BrushConfig()
  brush: Selection<SVGGElement, any, SVGGElement, any>
  unselectedRange: Selection<SVGGElement, any, SVGGElement, any>
  handleLines: Selection<SVGGElement, any, SVGGElement, any>
  brushBehaviour: BrushBehavior<any> = brushX()
  events = {
    [Brush.selectors.brush]: {
    },
  }

  _firstRender = true

  constructor (config?: BrushConfigInterface<Data>) {
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

  setScaleRange (key: string): void {
    const { config: { scales, width, height } } = this
    if (!key || !scales[key]) return

    const range = key === AxisType.Y ? [height, 0] : [0, width]
    scales[key]?.range(range)
  }

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

    this.g.selectAll('.handle')
      .attr('y', yRange[1])
      .attr('height', h)

    this.unselectedRange
      .attr('y', yRange[1])
      .attr('height', h)

    this.handleLines
      .attr('y1', yRange[1] + h / 2 - 10)
      .attr('y2', yRange[1] + h / 2 + 10)

    const brushRange = (config.selection&& isFinite(config.selection?.[0])) ?.[0] ? [xScale(config.selection[0]), xScale(config.selection[1])] : xScale.range()
    smartTransition(this.brush, duration)
      .call(brushBehaviour.move, brushRange) // Sets up the brush and calls brush events
      .on('end interrupt', () => { this._firstRender = false })
      // We track the first render to not trigger user events on component initialization
  }

  _updateSelection (s: number[]): void {
    const { config } = this
    const xScale = config.scales.x
    const yScale = config.scales.y
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

    // D3 sets brush handle height to be too long, so we need to update it
    const yRange = yScale.range()
    const h = yRange[0] - yRange[1]
    this.g.selectAll('.handle')
      .attr('y', yRange[1])
      .attr('height', h)
  }

  _onBrush (): void {
    const { config } = this
    const xScale = config.scales.x
    const s = event?.selection || xScale.range()

    // When you reset selection by clicking on a non-selected brush area, D3 triggers the brush event twice.
    // The first call will have equal selection coordinates (e.g. [441, 441]), the second call will have the full range (e.g. [0, 700]).
    // To avoid unnecessary render from the first call we skip it
    if (s[0] !== s[1]) {
      const selectedDomain = s.map(xScale.invert, xScale)
      config.selection = selectedDomain
      this._updateSelection(s)
      if (!this._firstRender) config.onBrush(config.selection, event)
    }
  }

  _onBrushStart (): void {
    const { config } = this

    this._onBrush()
    if (!this._firstRender) config.onBrushStart(config.selection, event)
  }

  _onBrushMove (): void {
    const { config } = this

    this._onBrush()
    if (!this._firstRender) config.onBrushMove(config.selection, event)
  }

  _onBrushEnd (): void {
    const { config } = this

    this._onBrush()
    if (!this._firstRender) config.onBrushEnd(config.selection, event)
  }
}
