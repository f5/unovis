// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection, pointer } from 'd3-selection'
import { easeLinear } from 'd3-ease'
// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { isNumber, isArray, getNumber, clamp, getStackedValues, getNearest } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
import { NumericAccessor } from 'types/accessor'
import { PositionStrategy } from 'types/position'

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

    this.g.style('opacity', this.show ? 1 : 0)
    this.line = this.g.append('line')
      .attr('class', s.line)
  }

  setContainer (containerSvg: Selection<SVGSVGElement, any, any, any>): void {
    // Set up mousemove event for Crosshair
    this.container = containerSvg
    this.container.on('mousemove.crosshair', this._onMouseMove.bind(this))
    this.container.on('mouseout.crosshair', this._onMouseOut.bind(this))
  }

  _render (customDuration?: number): void {
    const { config } = this
    if (!this.datum) return
    const duration = isNumber(customDuration) ? customDuration : config.duration

    smartTransition(this.g, duration)
      .style('opacity', this.show ? 1 : 0)

    this.line
      .attr('y1', 0)
      .attr('y1', config.height)

    smartTransition(this.line, duration, easeLinear)
      .attr('x1', this.x)
      .attr('x2', this.x)

    const circleData = this.getCircleData()
    const circles = this.g
      .selectAll<SVGCircleElement, Datum>('circle')
      .data(circleData)

    const circlesEnter = circles.enter()
      .append('circle')
      .attr('class', s.circle)
      .attr('r', 0)
      .style('fill', (d, i) => getColor(this.datum, config.color, i))

    smartTransition(circlesEnter.merge(circles), duration, easeLinear)
      .attr('cx', this.x)
      .attr('cy', d => config.scales.y(d.value))
      .attr('r', 4)
      .style('opacity', d => d.visible ? 1 : 0)
      .style('fill', (d, i) => getColor(this.datum, config.color, i))

    circles.exit().remove()
  }

  hide (): void {
    this._onMouseOut()
  }

  _onMouseMove (event: MouseEvent): void {
    const { config, datamodel, element } = this
    const [x] = pointer(event, element)
    const scaleX = config.scales.x
    const valueX = scaleX.invert(x) as number

    this.datum = getNearest(datamodel.data, valueX, config.x)
    if (!this.datum) return

    this.x = clamp(Math.round(scaleX(getNumber(this.datum, config.x))), 0, config.width)

    // Show the crosshair only if it's in the chart range and not far from mouse pointer (if configured)
    this.show = (this.x >= 0) && (this.x <= config.width) && (config.hideWhenFarFromPointer && (Math.abs(this.x - x) < config.hideWhenFarFromPointerDistance))

    window.cancelAnimationFrame(this._animFrameId)
    this._animFrameId = window.requestAnimationFrame(() => {
      this._render()
    })

    if (this.show) this._showTooltip(event)
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

  _showTooltip (event: MouseEvent): void {
    const { config: { tooltip, template } } = this
    if (!tooltip) return

    const container = tooltip.getContainer() || this.container.node()
    const [x, y] = tooltip.config.positionStrategy === PositionStrategy.Fixed ? [event.clientX, event.clientY] : pointer(event, container)
    const content = template(this.datum)
    if (content) tooltip.show(content, { x, y })
  }

  _hideTooltip (): void {
    const { config: { tooltip } } = this
    tooltip?.hide()
  }

  // We don't want Crosshair to be be taken in to account in domain calculations
  getYDataExtent (): number[] {
    return [undefined, undefined]
  }

  private getCircleData (): { index: number; value: any; visible: boolean }[] {
    const { config } = this
    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]
    const baselineValue = getNumber(this.datum, config.baseline) || 0
    const stackedValues = getStackedValues(this.datum, ...config.yStacked)
      .map((value, index, arr) => ({
        index,
        value: value + baselineValue,
        visible: !!getNumber(this.datum, config.yStacked[index]),
      }))

    const regularValues = yAccessors
      .map((a, index) => {
        const value = getNumber(this.datum, a)
        return {
          index,
          value,
          visible: !!value,
        }
      })

    return stackedValues.concat(regularValues)
  }
}
