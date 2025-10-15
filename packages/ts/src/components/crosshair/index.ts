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
import { FindNearestDirection } from 'types/data'

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

  private _isContainerInViewport (): boolean {
    if (!this.container?.node()) return false

    const containerRect = this.container.node().getBoundingClientRect()
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight

    // Calculate the visible area of the container
    const visibleWidth = Math.max(0, Math.min(containerRect.right, viewportWidth) - Math.max(containerRect.left, 0))
    const visibleHeight = Math.max(0, Math.min(containerRect.bottom, viewportHeight) - Math.max(containerRect.top, 0))
    const containerArea = containerRect.width * containerRect.height
    const visibleArea = visibleWidth * visibleHeight

    // Container must be at least 35% visible
    return containerArea > 0 && (visibleArea / containerArea) >= 0.35
  }

  constructor (config?: CrosshairConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)

    this.g.style('opacity', 0)
    this.line = this.g.append('line')
      .attr('class', s.line)
  }

  setContainer (containerSvg: Selection<SVGSVGElement, unknown, SVGSVGElement, unknown>): void {
    if (this.container === containerSvg) return

    this.container = containerSvg
    this.container.on('mousemove.crosshair', this._onMouseMove.bind(this))
    this.container.on('mouseout.crosshair', this._onMouseOut.bind(this))
    this.container.on('wheel.crosshair', this._onWheel.bind(this))
  }

  _render (customDuration?: number): void {
    const { config, datamodel } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    const isForceShowAtDefined = config.forceShowAt !== undefined
    const xPx = isForceShowAtDefined ? this.xScale(config.forceShowAt) : this._xPx

    const xValue = this.xScale.invert(xPx) as number

    const leftNearestDatumIndex = (datamodel.data?.length && this.accessors.x)
      ? datamodel.data.indexOf(
        getNearest(datamodel.data, xValue, this.accessors.x, FindNearestDirection.Left)
      ) : undefined

    // If `snapToData` is `true`, we need to find the nearest datum to the crosshair
    // It can be from a mouse interaction or from a `forceShowAt` setting
    let nearestDatum: Datum | undefined
    let nearestDatumIndex: number | undefined
    if (config.snapToData) {
      if (!this.accessors.y && !this.accessors.yStacked && datamodel.data?.length) {
        console.warn('Unovis | Crosshair: Y accessors have not been configured. Please check if they\'re present in the configuration object')
      }

      // Emit a warning if there's no data to snap to.
      // To keep the console clean, only emit the warning when there's mouse interaction.
      if (!datamodel.data?.length && this._mouseEvent) {
        console.warn('Unovis | Crosshair: No data to snap to. Make sure the data has been passed to the container or to the crosshair itself')
      }

      nearestDatum = getNearest(datamodel.data, xValue, this.accessors.x)
      nearestDatumIndex = datamodel.data.indexOf(nearestDatum)
    }

    const xRange = this.xScale.range()
    const yRange = this.yScale.range()
    const xClamped = config.snapToData && nearestDatum
      ? clamp(Math.round(this.xScale(getNumber(nearestDatum, this.accessors.x, nearestDatumIndex))), 0, this._width)
      : clamp(xPx, xRange[0], xRange[1])

    const isCrosshairWithinXRange = (xPx >= xRange[0]) && (xPx <= xRange[1])
    const isCrosshairWithinYRange = (this._yPx >= Math.min(yRange[0], yRange[1])) && (this._yPx <= Math.max(yRange[0], yRange[1]))
    let shouldShow = config.skipRangeCheck ? !!this._xPx : (this._xPx ? isCrosshairWithinXRange && isCrosshairWithinYRange : isCrosshairWithinXRange)

    // If the crosshair is far from the mouse pointer (usually when `snapToData` is `true` and data resolution is low), hide it
    if (config.hideWhenFarFromPointer && ((Math.abs(xClamped - (+xPx)) >= config.hideWhenFarFromPointerDistance))) {
      shouldShow = false
    }

    const tooltip = config.tooltip ?? this.tooltip
    if (shouldShow && tooltip && this._isContainerInViewport()) {
      const container = tooltip.getContainer() || this.container.node()
      const isContainerBody = tooltip.isContainerBody()

      if (isForceShowAtDefined) {
        // Convert SVG coordinates to screen coordinates
        const containerRect = this.container.node().getBoundingClientRect()

        // Use the actual left margin from the container
        const screenX = (isContainerBody ? xPx + containerRect.left : xPx) + this._containerMargin.left
        const screenY = this._height / 2 + (isContainerBody ? containerRect.top : 0)
        const pos = [screenX, screenY] as [number, number]
        this._showTooltip(nearestDatum, xValue, pos, leftNearestDatumIndex)
      } else if (this._mouseEvent) {
        const pos = (isContainerBody ? [this._mouseEvent.clientX, this._mouseEvent.clientY] : pointer(this._mouseEvent, container)) as [number, number]
        this._showTooltip(nearestDatum, xValue, pos, leftNearestDatumIndex)
      }
    } else this._hideTooltip()

    // Trigger `onCrosshairMove` if the render was triggered by a mouse move event
    if (this._mouseEvent) {
      config.onCrosshairMove?.(shouldShow ? this.xScale.invert(this._xPx) as number : undefined, nearestDatum, nearestDatumIndex, this._mouseEvent)
      this._mouseEvent = undefined
    }

    smartTransition(this.g, duration)
      .style('opacity', shouldShow ? 1 : 0)

    // When `config.forceShowAt` becomes `undefined`, the crosshair "jumps" to the edge of the chart.
    // This looks off, so we stop further rendering when the `xPx` value is not finite.
    if (!isFinite(xPx)) return

    this.line
      .attr('y1', 0)
      .attr('y2', this._height)

    smartTransition(this.line, duration, easeLinear)
      .attr('x1', xClamped)
      .attr('x2', xClamped)

    const circleData = isFunction(config.getCircles)
      ? config.getCircles(xValue, datamodel.data, this.yScale, leftNearestDatumIndex)
      : this.getCircleData(nearestDatum, nearestDatumIndex)

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

  hide (sourceEvent?: MouseEvent | WheelEvent): void {
    window.cancelAnimationFrame(this._animFrameId)
    this._animFrameId = window.requestAnimationFrame(() => {
      this._xPx = undefined
      this._yPx = undefined
      this._mouseEvent = undefined
      // We call `onCrosshairMove` with all the arguments set to `undefined` because we want
      // the users to be able to hide the crosshair easily when using `forceShowAt`
      this.config.onCrosshairMove?.(undefined, undefined, undefined, sourceEvent)
      this._render()
    })
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
      // We'll call `config.onCrosshairMove` in `_render` with the found `nearestDatum` and `nearestDatumIndex`,
      // which can come from the mouse interaction or from the `forceShowAt` setting
      this._render()
    })
  }

  _onMouseOut (event?: MouseEvent): void {
    // Only hide if the mouse actually left the SVG, not just moved to a child
    if (!event || !this.container?.node().contains((event as MouseEvent).relatedTarget as Node)) {
      this.hide(event)
    }
  }

  _onWheel (event: WheelEvent): void {
    this.hide(event)
  }

  _showTooltip (datum: Datum, xValue: number, pos: [number, number], nearestDatumIndex: number | undefined): void {
    const { config, datamodel } = this
    const tooltip = config.tooltip ?? this.tooltip
    if (!tooltip || !pos) return

    const [x, y] = pos
    const content = config.template(datum, xValue, datamodel.data, nearestDatumIndex)
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
