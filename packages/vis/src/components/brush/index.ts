// Copyright (c) Volterra, Inc. All rights reserved.
import { BrushBehavior, brushX, D3BrushEvent } from 'd3-brush'
import { Selection } from 'd3-selection'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { isNumber, clamp } from 'utils/data'
import { smartTransition } from 'utils/d3'

// Types
import { Direction } from 'types/direction'
import { AxisType } from 'types/axis'
import { Arrangement } from 'types/position'

// Config
import { BrushConfig, BrushConfigInterface } from './config'

// Styles
import * as s from './style'

export class Brush<Datum> extends XYComponentCore<Datum> {
  static selectors = s
  clippable = false // Don't apply clipping path to this component. See XYContainer
  config: BrushConfig<Datum> = new BrushConfig()
  brush: Selection<SVGGElement, any, SVGGElement, any>
  unselectedRange: Selection<SVGGElement, any, SVGGElement, any>
  handleLines: Selection<SVGGElement, any, SVGGElement, any>
  brushBehaviour: BrushBehavior<any> = brushX()
  events = {
    [Brush.selectors.brush]: {
    },
  }

  _firstRender = true

  constructor (config?: BrushConfigInterface<Datum>) {
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
      .on('start', this._onBrushStart.bind(this))
      .on('brush', this._onBrushMove.bind(this))
      .on('end', this._onBrushEnd.bind(this))

    this.brush
      .call(brushBehaviour)
      .classed('non-draggable', !config.draggable)

    const yRange = yScale.range()
    const h = yRange[0] - yRange[1]

    this.g.selectAll('.handle')
      .attr('y', yRange[1])
      .attr('height', h)

    this.unselectedRange
      .attr('y', yRange[1])
      .attr('height', h)

    this.handleLines
      .attr('y1', yRange[1] + 10)
      .attr('y2', yRange[1] + h - 10)

    const xRange = xScale.range()
    const selectionMin = clamp(xScale(config.selection?.[0]) ?? 0, xRange[0], xRange[1])
    const selectionMax = clamp(xScale(config.selection?.[1]) ?? 0, xRange[0], xRange[1])
    const selectionLength = selectionMax - selectionMin
    const brushRange = (selectionLength ? [selectionMin, selectionMax] : xScale.range()) as [number, number]

    this._positionHandles(brushRange)

    smartTransition(this.brush, duration)
      .call(brushBehaviour.move, brushRange) // Sets up the brush and calls brush events
      .on('end interrupt', () => { this._firstRender = false })
      // We track the first render to not trigger user events on component initialization
    if (!duration) this._firstRender = false
  }

  _updateSelection (s: [number, number]): void {
    const { config } = this
    const xScale = config.scales.x
    const yScale = config.scales.y
    const xRange = xScale.range()
    this.unselectedRange
      .attr('x', d => d.type === Direction.WEST ? xRange[0] : s[1])
      .attr('width', d => {
        const length = d.type === Direction.WEST ? s[0] - xRange[0] : xRange[1] - s[1]
        const lengthClamped = clamp(length, 0, xRange[1] - xRange[0])
        return lengthClamped
      })

    this._positionHandles(s)

    // D3 sets brush handle height to be too long, so we need to update it
    const yRange = yScale.range()
    const h = yRange[0] - yRange[1]
    this.g.selectAll('.handle')
      .attr('y', yRange[1])
      .attr('height', h)
  }

  private _positionHandles (s: [number, number]): void {
    const { config } = this

    this.brush.selectAll('.handle')
      .attr('width', config.handleWidth)
      .attr('x', d => {
        if (!s) return 0
        const west = (d as any).type === Direction.WEST
        const inside = config.handlePosition === Arrangement.INSIDE

        if (west) return s[0] + (inside ? 0 : -config.handleWidth)
        else return s[1] + (inside ? -config.handleWidth : 0)
      })

    this.handleLines
      .attr('transform', d => {
        if (!s) return null
        const west = (d as any).type === Direction.WEST
        const inside = config.handlePosition === Arrangement.INSIDE
        return `translate(${west
          ? s[0] - (-1) ** Number(inside) * config.handleWidth / 2
          : s[1] + (-1) ** Number(inside) * config.handleWidth / 2},0)`
      })
  }

  _onBrush (event: D3BrushEvent<Datum>): void {
    const { config } = this
    const xScale = config.scales.x
    const xRange = xScale.range()
    const s = (event?.selection || xRange) as [number, number]
    const userDriven = !!event?.sourceEvent

    // Handle edge cases:
    // (event?.selection === null) happens when user clicks to reset the selection
    // (s?.[0] === s?.[1]) happens when user drags the selection out of range
    if (userDriven && (
      (event?.selection === null) || // happens when user clicks to reset the selection
      (s?.[0] === s?.[1]) || // happens when user drags the selection out of range
      (s?.[0] < xRange[0]) || //
      (s?.[0] > xRange[1]) || // happens when you drag the brush and the domain updates
      (s?.[1] < xRange[0]) || // to a smaller one and brush goes out of range
      (s?.[1] > xRange[1]) //
    )) {
      this.brush.call(this.brushBehaviour.move, xRange) // Will trigger the 'brush end' callback with `range`
      return
    }

    // When you reset selection by clicking on a non-selected brush area, D3 triggers the brush event twice.
    // The first call will have equal selection coordinates (e.g. [441, 441]), the second call will have the full range (e.g. [0, 700]).
    // To avoid unnecessary render from the first call we skip it
    if (s[0] !== s[1] && isNumber(s[0]) && isNumber(s[1])) {
      const selectedDomain = s.map(n => xScale.invert(n)) as [number, number]

      if (userDriven) {
        // Constraint the selection if configured
        const xDomain = xScale.domain() as [number, number]
        const xDomainLength = Math.abs(xDomain[1] - xDomain[0])
        const selectionLength = Math.abs(selectedDomain[1] - selectedDomain[0])

        if (config.selectionMinLength >= xDomainLength) {
          console.warn('Configured `selectionMinLength` is bigger than the brush domain')
        }

        if ((selectionLength < config.selectionMinLength) && (config.selectionMinLength < xDomainLength)) {
          const range = [xScale(config.selection[0]), xScale(config.selection[1])] as [number, number]
          this.brush.call(this.brushBehaviour.move, range) // Will trigger the 'brush end' callback with `range`
          return
        } else {
          config.selection = selectedDomain
        }
      }

      // if (userDriven) config.selection = selectedDomain
      this._updateSelection(s)
      if (!this._firstRender) config.onBrush(selectedDomain, event, userDriven)
    }
  }

  _onBrushStart (event: D3BrushEvent<Datum>): void {
    const { config } = this

    this._onBrush(event)
    if (!this._firstRender) config.onBrushStart(config.selection, event, !!event?.sourceEvent)
  }

  _onBrushMove (event: D3BrushEvent<Datum>): void {
    const { config } = this

    this._onBrush(event)
    if (!this._firstRender) config.onBrushMove(config.selection, event, !!event?.sourceEvent)
  }

  _onBrushEnd (event: D3BrushEvent<Datum>): void {
    const { config } = this

    this._onBrush(event)
    if (!this._firstRender) config.onBrushEnd(config.selection, event, !!event?.sourceEvent)
  }
}
