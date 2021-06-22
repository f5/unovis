// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection } from 'd3-selection'
import { BrushBehavior, brush, brushX, brushY, D3BrushEvent } from 'd3-brush'

import { XYComponentCore } from 'core/xy-component'
import { isNumber } from 'utils/data'

import { BrushInteractiveType } from 'types/brush-interactive'
import { BrushInteractiveConfig, BrushInteractiveConfigInterface } from './config'

// Styles
import * as s from './style'

export class BrushInteractive<Datum> extends XYComponentCore<Datum> {
    config: BrushInteractiveConfig<Datum> = new BrushInteractiveConfig();
    brush: Selection<SVGGElement, any, SVGGElement, any>
    brushBehaviour: BrushBehavior<any>;
    _firstRender: any;
    constructor (config: BrushInteractiveConfigInterface<Datum>) {
      super()
      if (config) this.config.init(config)

      this.brush = this.g
        .append('g')
        .attr('class', s.brush)
    }

    _render (customDuration?: number): void {
      const { config } = this
      switch (config.type) {
      case BrushInteractiveType.X:
        this.brushBehaviour = brushX()
        break
      case BrushInteractiveType.Y:
        this.brushBehaviour = brushY()
        break
      default:
        this.brushBehaviour = brush()
        break
      }

      this.brushBehaviour
        .extent([[0, 0], [config.width, config.height]])
        .on('start', this._onBrushStart.bind(this))
        .on('brush', this._onBrushMove.bind(this))
        .on('end', this._onBrushEnd.bind(this))
      this.brush
        .call(this.brushBehaviour)
        .classed('non-draggable', !config.draggable)
      this._firstRender = false
    }

    _onBrush (event: D3BrushEvent<Datum>): void {
      const { config } = this
      if (config.type === BrushInteractiveType.XY) {
        this._onXYBrush(event, config)
        return
      }
      const scale = config.type === BrushInteractiveType.X ? config.scales.x : config.scales.y
      const s = (event?.selection) as [number, number]
      const userDriven = !!event?.sourceEvent
      if (s && isNumber(s[0]) && isNumber(s[1])) {
        const selectedDomain = s.map(n => scale.invert(n)) as [number, number]

        if (userDriven) {
          // Constraint the selection if configured
          const xDomain = scale.domain() as [number, number]
          const xDomainLength = Math.abs(xDomain[1] - xDomain[0])
          const selectionLength = Math.abs(selectedDomain[1] - selectedDomain[0])

          if (config.selectionMinLength >= xDomainLength) {
            console.warn('Configured `selectionMinLength` is bigger than the brush domain')
          }

          if ((selectionLength < config.selectionMinLength) && (config.selectionMinLength < xDomainLength)) {
            this.brush.call(this.brushBehaviour.move, null)
            return
          } else {
            config.selection = selectedDomain
          }
        }
        if (!this._firstRender) config.onBrush(selectedDomain, event, userDriven)
      } else {
        config.selection = null
      }
    }

    _onXYBrush (event: D3BrushEvent<Datum>, config: BrushInteractiveConfig<Datum>): void {
      const { x: xScale, y: yScale } = config.scales
      const s = (event?.selection) as [[number, number], [number, number]]
      const userDriven = !!event?.sourceEvent
      if (s && Array.isArray(s[0]) && Array.isArray(s[1])) {
        const selectedDomain = s.map(d => {
          return [xScale.invert(d[0]), yScale.invert(d[1])]
        }) as [[number, number], [number, number]]

        if (userDriven) {
          // Constraint the selection if configured
          const xDomain = xScale.domain() as [number, number]
          const yDomain = yScale.domain() as [number, number]
          const xDomainLength = Math.abs(xDomain[1] - xDomain[0])
          const yDomainLength = Math.abs(yDomain[1] - yDomain[0])
          const xselectionLength = Math.abs(selectedDomain[1][0] - selectedDomain[0][0])
          const yselectionLength = Math.abs(selectedDomain[1][1] - selectedDomain[0][1])

          if (config.selectionMinLength >= xDomainLength && config.selectionMinLength >= yDomainLength) {
            console.warn('Configured `selectionMinLength` is bigger than the brush domain')
          }

          if ((xselectionLength < config.selectionMinLength) && (config.selectionMinLength < xDomainLength) &&
          (yselectionLength < config.selectionMinLength) && (config.selectionMinLength < yDomainLength)
          ) {
            this.brush.call(this.brushBehaviour.move, null)
            return
          } else {
            config.selection = selectedDomain
          }
        }
        if (!this._firstRender) config.onBrush(selectedDomain, event, userDriven)
      } else {
        config.selection = null
      }
    }

    _updateSelection (s: [number, number]): void {
      // might be required for handle customization.
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
