// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection, mouse } from 'd3-selection'
import { easeLinear } from 'd3-ease'
// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { isNumber, isArray, getValue, clamp, getStackedValues, getNearest } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
import { NumericAccessor } from 'types/misc'
import { Position } from 'types/position'

// Config
import { CrosshairConfig, CrosshairConfigInterface } from './config'

// Styles
import * as s from './style'

export class Crosshair<Datum> extends XYComponentCore<Datum> {
  static selectors = s
  clippable = false // Don't apply clipping path to this component. See XYContainer
  config: CrosshairConfig<Datum> = new CrosshairConfig()
  container: Selection<SVGSVGElement, any, SVGSVGElement, any>
  line: Selection<SVGLineElement, any, SVGElement, any>
  x = 0
  datum: Datum
  show = false
  private _animFrameId: number = null

  constructor (config?: CrosshairConfigInterface<Datum>) {
    super()
    if (config) this.config.init(config)

    this.line = this.g.append('line')
      .attr('class', s.line)
  }

  setContainer (containerSvg: Selection<SVGSVGElement, any, SVGSVGElement, any>): void {
    // Set up mousemove event for Crosshair
    this.container = containerSvg
    this.container.on('mousemove.crosshair', this._onMouseMove.bind(this))
    this.container.on('mouseout.crosshair', this._onMouseOut.bind(this))
  }

  _render (customDuration?: number): void {
    const { config } = this
    if (!this.datum) return
    const duration = isNumber(customDuration) ? customDuration : config.duration
    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]

    smartTransition(this.g, duration)
      .style('opacity', this.show ? 1 : 0)

    this.line
      .attr('y1', 0)
      .attr('y1', config.height)

    smartTransition(this.line, duration, easeLinear)
      .attr('x1', this.x)
      .attr('x2', this.x)

    const baselineValue = getValue(this.datum, config.baseline) || 0
    const stackedValues = getStackedValues(this.datum, ...config.yStacked)
      .map((value, index, arr) => ({
        index,
        value: value + baselineValue,
        visible: !!(value - (arr[index - 1] ?? 0)),
      }))

    const regularValues = yAccessors
      .map((a, index) => {
        const value = getValue(this.datum, a)
        return {
          index,
          value,
          visible: !!value,
        }
      })
    const circleData = stackedValues.concat(regularValues)

    const circles = this.g.selectAll('circle')
      .data(circleData)

    const circlesEnter = circles.enter()
      .append('circle')
      .attr('class', s.circle)
      .attr('r', 0)
      .style('fill', d => getColor(this.datum, config.color, d.index))

    smartTransition(circlesEnter.merge(circles), duration, easeLinear)
      .attr('cx', this.x)
      .attr('cy', d => config.scales.y(d.value))
      .attr('r', 4)
      .style('opacity', d => d.visible ? 1 : 0)
      .style('fill', d => getColor(this.datum, config.color, d.index))
  }

  _onMouseMove (): void {
    const { config, datamodel, element } = this
    const [x] = mouse(element)
    const scale = config.scales.x
    const value = scale.invert(x) as number

    this.datum = getNearest(datamodel.data, value, config.x)
    if (!this.datum) return

    this.x = clamp(Math.round(scale(getValue(this.datum, config.x))), 0, config.width)

    // Show the crosshair only if it's in the chart range
    this.show = (this.x >= 0) && (this.x <= config.width)

    window.cancelAnimationFrame(this._animFrameId)
    this._animFrameId = window.requestAnimationFrame(() => {
      this._render()
    })

    if (this.show) this._showTooltip()
    else this._hideTooltip()
  }

  _onMouseOut (): void {
    this.show = false

    window.cancelAnimationFrame(this._animFrameId)
    this._animFrameId = window.requestAnimationFrame(() => {
      this._render()
    })
    this._hideTooltip()
  }

  _showTooltip (): void {
    const { config: { tooltip, template } } = this

    const [x, y] = mouse(this.container.node())
    if (tooltip) tooltip.config.horizontalPlacement = Position.RIGHT
    tooltip?.show(template(this.datum), { x, y })
  }

  _hideTooltip (): void {
    const { config: { tooltip } } = this
    tooltip?.hide()
  }
}
