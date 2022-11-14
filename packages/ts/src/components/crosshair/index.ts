import { Selection, pointer } from 'd3-selection'
import { easeLinear } from 'd3-ease'

// Core
import { XYComponentCore } from 'core/xy-component'
import { Tooltip } from 'components/tooltip'

// Utils
import { isNumber, isArray, getNumber, clamp, getStackedValues, getNearest, isFunction } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Local Types
import { CrosshairAccessors, CrosshairCircle } from './types'

// Config
import { CrosshairConfig, CrosshairConfigInterface } from './config'

// Styles
import * as s from './style'

export class Crosshair<Datum> extends XYComponentCore<Datum, CrosshairConfig<Datum>, CrosshairConfigInterface<Datum>> {
  static selectors = s
  clippable = true // Don't apply clipping path to this component. See XYContainer
  config: CrosshairConfig<Datum> = new CrosshairConfig()
  container: Selection<SVGSVGElement, any, SVGSVGElement, any>
  line: Selection<SVGLineElement, any, SVGElement, any>
  x = 0
  datum: Datum
  datumIndex: number
  show = false
  private _animFrameId: number = null

  /** Tooltip component to be used by Crosshair if not provided by the config.
   * This property is supposed to be set externally by a container component like XYContainer. */
  public tooltip: Tooltip

  /** Accessors passed externally (e.g. from XYContainer) */
  private _accessors: CrosshairAccessors<Datum> = {
    x: undefined,
    y: undefined,
    yStacked: undefined,
    baseline: undefined,
  }

  public set accessors (accessors: CrosshairAccessors<Datum>) { this._accessors = accessors }
  public get accessors (): CrosshairAccessors<Datum> {
    const { config } = this

    const hasConfig = !!(config.x || config.y || config.yStacked)
    const x = hasConfig ? config.x : this._accessors.x
    const yAcc = hasConfig ? config.y : this._accessors.y
    const y = yAcc ? (isArray(yAcc) ? yAcc : [yAcc]) : undefined
    const yStacked = hasConfig ? config.yStacked : this._accessors.yStacked
    const baseline = config.baseline ?? this._accessors.baseline

    return { x, y, yStacked, baseline }
  }

  constructor (config?: CrosshairConfigInterface<Datum>) {
    super()
    if (config) this.config.init(config)

    this.g.style('opacity', this.show ? 1 : 0)
    this.line = this.g.append('line')
      .attr('class', s.line)
  }

  setContainer (containerSvg: Selection<SVGSVGElement, unknown, SVGSVGElement, unknown>): void {
    // Set up mousemove event for Crosshair
    this.container = containerSvg
    this.container.on('mousemove.crosshair', this._onMouseMove.bind(this))
    this.container.on('mouseout.crosshair', this._onMouseOut.bind(this))
  }

  _render (customDuration?: number): void {
    const { config } = this
    if (config.snapToData && !this.datum) return
    const duration = isNumber(customDuration) ? customDuration : config.duration

    smartTransition(this.g, duration)
      .style('opacity', this.show ? 1 : 0)

    this.line
      .attr('y1', 0)
      .attr('y1', this._height)

    smartTransition(this.line, duration, easeLinear)
      .attr('x1', this.x)
      .attr('x2', this.x)

    const circleData = this.getCircleData()
    const circles = this.g
      .selectAll<SVGCircleElement, CrosshairCircle>('circle')
      .data(circleData, (d, i) => d.id ?? i)

    const circlesEnter = circles.enter()
      .append('circle')
      .attr('class', s.circle)
      .attr('r', 0)
      .attr('cx', this.x)
      .attr('cy', d => d.y)
      .style('fill', d => d.color)

    smartTransition(circlesEnter.merge(circles), duration, easeLinear)
      .attr('cx', this.x)
      .attr('cy', d => d.y)
      .attr('r', 4)
      .style('opacity', d => d.opacity)
      .style('fill', d => d.color)

    circles.exit().remove()
  }

  hide (): void {
    this._onMouseOut()
  }

  _onMouseMove (event: MouseEvent): void {
    const { config, datamodel, element } = this
    if (!this.accessors.x && datamodel.data?.length) {
      console.warn('Unovis | Crosshair: X accessor function has not been configured. Please check if it\'s present in the configuration object')
    }
    const [x] = pointer(event, element)
    const xRange = this.xScale.range()

    if (config.snapToData) {
      if (!this.accessors.y && !this.accessors.yStacked && datamodel.data?.length) {
        console.warn('Unovis | Crosshair: Y accessors have not been configured. Please check if they\'re present in the configuration object')
      }
      const scaleX = this.xScale
      const valueX = scaleX.invert(x) as number

      this.datum = getNearest(datamodel.data, valueX, this.accessors.x)
      this.datumIndex = datamodel.data.indexOf(this.datum)
      if (!this.datum) return

      this.x = clamp(Math.round(scaleX(getNumber(this.datum, this.accessors.x, this.datumIndex))), 0, this._width)

      // Show the crosshair only if it's in the chart range and not far from mouse pointer (if configured)
      this.show = (this.x >= 0) && (this.x <= this._width) && (!config.hideWhenFarFromPointer || (Math.abs(this.x - x) < config.hideWhenFarFromPointerDistance))
    } else {
      const tolerance = 2 // Show the crosshair when it is at least 2 pixels close to the chart area
      this.x = clamp(x, xRange[0], xRange[1])
      this.show = (x >= (xRange[0] - tolerance)) && (x <= (xRange[1] + tolerance))
    }

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
    const { config } = this
    const tooltip = config.tooltip ?? this.tooltip
    if (!tooltip) return

    const container = tooltip.getContainer() || this.container.node()
    const [x, y] = tooltip.isContainerBody() ? [event.clientX, event.clientY] : pointer(event, container)
    const content = config.template(this.datum, this.xScale.invert(this.x))
    if (content) tooltip.show(content, { x, y })
  }

  _hideTooltip (): void {
    const { config } = this
    const tooltip = config.tooltip ?? this.tooltip
    tooltip?.hide()
  }

  // We don't want Crosshair to be be taken in to account in domain calculations
  getYDataExtent (): number[] {
    return [undefined, undefined]
  }

  private getCircleData (): CrosshairCircle[] {
    const { config, datamodel: { data } } = this

    if (isFunction(config.getCircles)) return config.getCircles(this.xScale.invert(this.x), data, this.yScale)

    if (config.snapToData && this.datum) {
      const yAccessors = this.accessors.y ?? []
      const yStackedAccessors = this.accessors.yStacked ?? []
      const baselineValue = getNumber(this.datum, this.accessors.baseline, this.datumIndex) || 0
      const stackedValues: CrosshairCircle[] = getStackedValues(this.datum, this.datumIndex, ...yStackedAccessors)
        .map((value, index, arr) => ({
          y: this.yScale(value + baselineValue),
          opacity: getNumber(this.datum, yStackedAccessors[index]) ? 1 : 0,
          color: getColor(this.datum, config.color, index),
        }))

      const regularValues: CrosshairCircle[] = yAccessors
        .map((a, index) => {
          const value = getNumber(this.datum, a)
          return {
            y: this.yScale(value),
            opacity: value ? 1 : 0,
            color: getColor(this.datum, config.color, stackedValues.length + index),
          }
        })

      return stackedValues.concat(regularValues)
    }

    return []
  }
}
