import { Selection, pointer } from 'd3-selection'
import { easeLinear } from 'd3-ease'

// Core
import { XYComponentCore } from 'core/xy-component'
import { Tooltip } from 'components/tooltip'

// Utils
import { isNumber, isArray, getNumber, clamp, getStackedValues, getNearest, isFunction } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
import { Position } from 'types/position'

// Local Types
import { CrosshairAccessors, CrosshairCircle } from './types'

// Config
import { CrosshairDefaultConfig, CrosshairConfigInterface } from './config'

// Styles
import * as s from './style'

export class Crosshair<Datum> extends XYComponentCore<Datum, CrosshairConfigInterface<Datum>> {
  static selectors = s
  clippable = true // Don't apply clipping path to this component. See XYContainer
  protected _defaultConfig = CrosshairDefaultConfig as CrosshairConfigInterface<Datum>
  public config: CrosshairConfigInterface<Datum> = this._defaultConfig
  container: Selection<SVGSVGElement, any, SVGSVGElement, any>
  line: Selection<SVGLineElement, any, SVGElement, any>
  private _xPx: number | undefined = undefined
  private _yPx: number | undefined = undefined
  private _mouseEvent: MouseEvent | undefined = undefined
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
    if (config) this.setConfig(config)

    this.g.style('opacity', 0)
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
    const { config, datamodel } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    const isForceShowAtDefined = config.forceShowAt !== undefined
    const xPx = isForceShowAtDefined ? this.xScale(config.forceShowAt) : this._xPx

    const xValue = this.xScale.invert(xPx) as number

    let datum: Datum | undefined
    let datumIndex: number | undefined
    if (config.snapToData) {
      if (!this.accessors.y && !this.accessors.yStacked && datamodel.data?.length) {
        console.warn('Unovis | Crosshair: Y accessors have not been configured. Please check if they\'re present in the configuration object')
      }

      datum = getNearest(datamodel.data, xValue, this.accessors.x)
      datumIndex = datamodel.data.indexOf(datum)
      if (!datum) return
    }

    const xRange = this.xScale.range()
    const yRange = this.yScale.range()
    const xClamped = config.snapToData
      ? clamp(Math.round(this.xScale(getNumber(datum, this.accessors.x, datumIndex))), 0, this._width)
      : clamp(xPx, xRange[0], xRange[1])

    const isCrosshairWithinXRange = (xPx >= xRange[0]) && (xPx <= xRange[1])
    const isCrosshairWithinYRange = (this._yPx >= yRange[1]) && (this._yPx <= yRange[0])
    let shouldShow = this._xPx ? isCrosshairWithinXRange && isCrosshairWithinYRange : isCrosshairWithinXRange

    // If the crosshair is far from the mouse pointer (usually when `snapToData` is `true` and data resolution is low), hide it
    if (config.hideWhenFarFromPointer && ((Math.abs(xClamped - (+xPx)) >= config.hideWhenFarFromPointerDistance))) {
      shouldShow = false
    }

    const tooltip = config.tooltip ?? this.tooltip
    if (shouldShow && tooltip) {
      const container = tooltip.getContainer() || this.container.node()
      const isContainerBody = tooltip.isContainerBody()
      if (isForceShowAtDefined) {
        // Convert SVG coordinates to screen coordinates
        const containerRect = this.container.node().getBoundingClientRect()

        // TODO: This needs to be the left margin of the container
        const margin = this._containerWidth - this._width
        const screenX = (isContainerBody ? xPx + containerRect.left : xPx) + margin
        const screenY = this._height / 2 + (isContainerBody ? containerRect.top : 0)
        const pos = [screenX, screenY] as [number, number]
        this._showTooltip(datum, xValue, pos)
      } else if (this._mouseEvent) {
        const pos = (isContainerBody ? [this._mouseEvent.clientX, this._mouseEvent.clientY] : pointer(this._mouseEvent, container)) as [number, number]
        this._showTooltip(datum, xValue, pos)
      }
    } else this._hideTooltip()

    // Trigger `onCrosshairMove` if the render was triggered by a mouse move event
    if (this._mouseEvent) {
      config.onCrosshairMove?.(shouldShow ? this.xScale.invert(this._xPx) as number : undefined, datum, datumIndex)
      this._mouseEvent = undefined
    }

    // When `config.forceShowAt` becomes undefined, the component will "jump" to `this._xPx` which is set to the last mouse position.
    // This looks off, so we set `this._xPx` to `xPx` to make it look like the crosshair is rendered at the forced position
    if (isForceShowAtDefined) {
      this._xPx = undefined
    }

    smartTransition(this.g, duration)
      .style('opacity', shouldShow ? 1 : 0)

    this.line
      .attr('y1', 0)
      .attr('y1', this._height)

    // Don't render the crosshair if the xPx is not finite
    if (!isFinite(xClamped)) return

    smartTransition(this.line, duration, easeLinear)
      .attr('x1', xClamped)
      .attr('x2', xClamped)

    const circleData = isFunction(config.getCircles)
      ? config.getCircles(xValue, datamodel.data, this.yScale)
      : this.getCircleData(datum, datumIndex)

    const circles = this.g
      .selectAll<SVGCircleElement, CrosshairCircle>('circle')
      .data(circleData, (d, i) => d.id ?? i)

    const circlesEnter = circles.enter()
      .append('circle')
      .attr('class', s.circle)
      .attr('r', 0)
      .attr('cx', xClamped)
      .attr('cy', d => d.y)
      .style('fill', d => d.color)
      .style('stroke', d => d.strokeColor)
      .style('stroke-width', d => d.strokeWidth)

    smartTransition(circlesEnter.merge(circles), duration, easeLinear)
      .attr('cx', xClamped)
      .attr('cy', d => d.y)
      .attr('r', 4)
      .style('opacity', d => d.opacity)
      .style('fill', d => d.color)
      .style('stroke', d => d.strokeColor)
      .style('stroke-width', d => d.strokeWidth)

    circles.exit().remove()
  }

  hide (): void {
    this._onMouseOut()
  }

  _onMouseMove (event: MouseEvent): void {
    const { datamodel, element } = this
    if (!this.accessors.x && datamodel.data?.length) {
      console.warn('Unovis | Crosshair: X accessor function has not been configured. Please check if it\'s present in the configuration object')
    }
    const [x, y] = pointer(event, element)
    this._xPx = x
    this._yPx = y
    this._mouseEvent = event

    window.cancelAnimationFrame(this._animFrameId)
    this._animFrameId = window.requestAnimationFrame(() => {
      this._render()
    })
  }

  _onMouseOut (): void {
    window.cancelAnimationFrame(this._animFrameId)
    this._animFrameId = window.requestAnimationFrame(() => {
      this._render()
    })
  }

  _showTooltip (datum: Datum, xValue: number, pos: [number, number]): void {
    const { config } = this
    const tooltip = config.tooltip ?? this.tooltip
    if (!tooltip || !pos) return

    const [x, y] = pos
    const content = config.template(datum, xValue)
    // Force set `followCursor` to `true` because we don't want Crosshair's tooltip to be hoverable
    tooltip.config.followCursor = true

    // Set tooltip placement based on Crosshair's position (left / right)
    if (!tooltip.config.horizontalPlacement || tooltip.config.horizontalPlacement === Position.Auto) {
      const xRelative = tooltip.isContainerBody() ? x - this.container.node().getBoundingClientRect().left : x
      tooltip.overrideHorizontalPlacement(xRelative > this._containerWidth / 2 ? Position.Left : Position.Right)
    }

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

  private getCircleData (datum: Datum, datumIndex: number): CrosshairCircle[] {
    const { config } = this

    if (config.snapToData && datum) {
      const yAccessors = this.accessors.y ?? []
      const yStackedAccessors = this.accessors.yStacked ?? []
      const baselineValue = getNumber(datum, this.accessors.baseline, datumIndex) || 0
      const stackedValues: CrosshairCircle[] = getStackedValues(datum, datumIndex, ...yStackedAccessors)
        .map((value, index) => ({
          y: this.yScale(value + baselineValue),
          opacity: isNumber(getNumber(datum, yStackedAccessors[index], index)) ? 1 : 0,
          color: getColor(datum, config.color, index),
          strokeColor: config.strokeColor ? getColor(datum, config.strokeColor, index) : undefined,
          strokeWidth: config.strokeWidth ? getNumber(datum, config.strokeWidth, index) : undefined,
        }))

      const regularValues: CrosshairCircle[] = yAccessors
        .map((a, index) => {
          const value = getNumber(datum, a, datumIndex)
          return {
            y: this.yScale(value),
            opacity: isNumber(value) ? 1 : 0,
            color: getColor(datum, config.color, stackedValues.length + index),
            strokeColor: config.strokeColor ? getColor(datum, config.strokeColor, index) : undefined,
            strokeWidth: config.strokeWidth ? getNumber(datum, config.strokeWidth, index) : undefined,
          }
        })

      return stackedValues.concat(regularValues)
    }

    return []
  }
}
