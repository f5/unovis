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
  x = 0
  datum: Datum
  datumIndex: number
  show = false
  private _animFrameId: number = null
  private _currentXData: number | Date | undefined = undefined
  private _documentMouseHandler: (event: MouseEvent) => void | null = null
  private _isMouseOver = false

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
    // If x or y are explicitly set in config, use those; otherwise use container accessors
    const x = config.x || this._accessors.x
    const yAcc = config.y || this._accessors.y
    const y = yAcc ? (isArray(yAcc) ? yAcc : [yAcc]) : undefined
    const yStacked = config.yStacked || this._accessors.yStacked
    const baseline = config.baseline ?? this._accessors.baseline

    return { x, y, yStacked, baseline }
  }

  constructor (config?: CrosshairConfigInterface<Datum>) {
    super()
    if (config) this.config = { ...this.config, ...config }

    this.g.style('opacity', this.show ? 1 : 0)
    this.line = this.g.append('line')
      .attr('class', s.line)
  }

  setContainer (containerSvg: Selection<SVGSVGElement, unknown, SVGSVGElement, unknown>): void {
    this.container = containerSvg
    this.container.on('mousemove.crosshair', this._onMouseMove.bind(this))
    this.container.on('mouseout.crosshair', this._onMouseOut.bind(this))
    this._render()
  }

  _render (customDuration?: number): void {
    const { config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    const { isActive, enableSync } = this._getSyncState()

    // Handle synchronized charts with xPosition prop
    if (enableSync && !isActive && (isNumber(config.xPosition) || config.xPosition instanceof Date)) {
      this._updateFromSync(config.xPosition)
    }

    smartTransition(this.g, duration).style('opacity', this.show ? 1 : 0)

    this.line
      .attr('y1', 0)
      .attr('y2', this._height)

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
      .style('stroke', d => d.strokeColor)
      .style('stroke-width', d => d.strokeWidth)

    smartTransition(circlesEnter.merge(circles), duration, easeLinear)
      .attr('cx', this.x)
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

  destroy (): void {
    if (this._animFrameId) {
      window.cancelAnimationFrame(this._animFrameId)
      this._animFrameId = null
    }
    this._hideTooltip()
    this._removeDocumentMouseTracking()
  }

  _onMouseMove (event: MouseEvent): void {
    this._isMouseOver = true
    const { config, datamodel, element } = this
    const { isActive, enableSync } = this._getSyncState()

    // Early return for synchronized non-active charts, but allow tooltip display
    if (enableSync && !isActive) {
      if (this.show && this.datum) {
        this._showTooltip(event)
      }
      return
    }

    // Check if we have the necessary accessors
    if (!this.accessors.x && datamodel.data?.length) {
      console.warn('Unovis | Crosshair: X accessor function has not been configured. Please check if it\'s present in the configuration object')
      return
    }

    const [x] = pointer(event, element)
    const xRange = this.xScale.range()

    if (config.snapToData) {
      if (!this.accessors.y && !this.accessors.yStacked && datamodel.data?.length) {
        console.warn('Unovis | Crosshair: Y accessors have not been configured. Please check if they\'re present in the configuration object')
        return
      }
      const scaleX = this.xScale
      const valueX = scaleX.invert(x) as number

      this.datum = getNearest(datamodel.data, valueX, this.accessors.x)
      this.datumIndex = datamodel.data.indexOf(this.datum)
      if (!this.datum) return

      const dataX = getNumber(this.datum, this.accessors.x, this.datumIndex)
      this.x = clamp(Math.round(scaleX(dataX)), 0, this._width)
      this._currentXData = dataX

      // Show the crosshair only if it's in the chart range and not far from mouse pointer (if configured)
      this.show = (this.x >= 0) && (this.x <= this._width) && (!config.hideWhenFarFromPointer || (Math.abs(this.x - x) < config.hideWhenFarFromPointerDistance))
    } else {
      const tolerance = 2 // Show the crosshair when it is at least 2 pixels close to the chart area
      this.x = clamp(x, xRange[0], xRange[1])
      this._currentXData = this.xScale.invert(this.x)
      this.show = (x >= (xRange[0] - tolerance)) && (x <= (xRange[1] + tolerance))
    }

    // Call onCrosshairMove callback if provided
    if (this.show && config.onCrosshairMove && this._currentXData !== undefined) {
      config.onCrosshairMove(this._currentXData)
    }

    // Set up document-level mouse tracking for active charts
    if (enableSync && isActive && config.onCrosshairMove) {
      this._setupDocumentMouseTracking()
    }

    window.cancelAnimationFrame(this._animFrameId)
    this._animFrameId = window.requestAnimationFrame(() => {
      this._render()
    })

    if (this.show) this._showTooltip(event)
    else this._hideTooltip()
  }

  _setupDocumentMouseTracking (): void {
    const { config } = this

    // Remove any existing document mouse listener
    this._removeDocumentMouseTracking()

    // Add document-level mouse move listener to detect when mouse leaves the chart area
    const handleDocumentMouseMove = (event: MouseEvent): void => {
      const chartRect = this.container.node().getBoundingClientRect()
      const isInsideChart = event.clientX >= chartRect.left &&
                           event.clientX <= chartRect.right &&
                           event.clientY >= chartRect.top &&
                           event.clientY <= chartRect.bottom

      if (!isInsideChart) {
        config.onCrosshairMove(undefined)
        this._removeDocumentMouseTracking()
      }
    }

    // Store the handler so we can remove it later
    this._documentMouseHandler = handleDocumentMouseMove
    document.addEventListener('mousemove', handleDocumentMouseMove)
  }

  _removeDocumentMouseTracking (): void {
    if (this._documentMouseHandler) {
      document.removeEventListener('mousemove', this._documentMouseHandler)
      this._documentMouseHandler = null
    }
  }

  _onMouseOut (): void {
    this._isMouseOver = false
    const { config } = this

    // Always hide on mouse out
    this.show = false
    this._hideTooltip()
    window.cancelAnimationFrame(this._animFrameId)
    this._animFrameId = window.requestAnimationFrame(() => {
      this._render()
    })

    // If this is the active chart, notify parent to clear sync state
    if (config.onCrosshairMove) {
      config.onCrosshairMove(undefined)
    }
  }

  _showTooltip (event: MouseEvent): void {
    const tooltip = this.config.tooltip ?? this.tooltip

    if (!tooltip) return

    const { isActive, enableSync } = this._getSyncState()

    // For synchronized charts, we need to find the datum if it doesn't exist
    let datum = this.datum
    if (!datum && enableSync && !isActive && this._currentXData !== undefined) {
      if (typeof this._currentXData === 'number') {
        datum = getNearest(this.datamodel.data, this._currentXData, this.accessors.x)
      }
    }

    if (!datum) return

    const container = tooltip.getContainer() || this.container.node()
    const [x, y] = tooltip.isContainerBody() ? [event.clientX, event.clientY] : pointer(event, container)
    const content = this.config.template(datum, this._currentXData || this.xScale.invert(this.x))

    tooltip.config.followCursor = true

    // Set tooltip placement based on Crosshair's position (left / right)
    if (!tooltip.config.horizontalPlacement || tooltip.config.horizontalPlacement === Position.Auto) {
      const xRelative = tooltip.isContainerBody() ? x - this.container.node().getBoundingClientRect().left : x
      tooltip.overrideHorizontalPlacement(xRelative > this._containerWidth / 2 ? Position.Left : Position.Right)
    }

    if (content) tooltip.show(content, { x, y })
  }

  _hideTooltip (): void {
    const tooltip = this.config.tooltip ?? this.tooltip
    tooltip?.hide()
  }

  // We don't want Crosshair to be taken into account in domain calculations
  getYDataExtent (): number[] {
    return [undefined, undefined]
  }

  private getCircleData (): CrosshairCircle[] {
    const { datamodel: { data } } = this
    const { isActive, enableSync } = this._getSyncState()

    if (isFunction(this.config.getCircles)) {
      return this.config.getCircles(this._currentXData || this.xScale.invert(this.x), data, this.yScale)
    }

    // Get the datum - either from active mode or from synchronized mode
    let datum = this.datum
    let datumIndex = this.datumIndex

    if (!datum && enableSync && !isActive && this._currentXData !== undefined) {
      if (typeof this._currentXData === 'number') {
        datum = getNearest(this.datamodel.data, this._currentXData, this.accessors.x)
        datumIndex = this.datamodel.data.indexOf(datum)
      }
    }

    if (this.config.snapToData && datum) {
      const yAccessors = this.accessors.y ?? []
      const yStackedAccessors = this.accessors.yStacked ?? []
      const baselineValue = getNumber(datum, this.accessors.baseline, datumIndex) || 0

      const stackedValues: CrosshairCircle[] = getStackedValues(datum, datumIndex, ...yStackedAccessors)
        .map((value, index) => {
          const yValue = value + baselineValue
          const yPixel = this.yScale(yValue)
          return {
            y: yPixel,
            opacity: isNumber(getNumber(datum, yStackedAccessors[index])) ? 1 : 1,
            color: getColor(datum, this.config.color, index),
            strokeColor: this.config.strokeColor ? getColor(datum, this.config.strokeColor, index) : undefined,
            strokeWidth: this.config.strokeWidth ? getNumber(datum, this.config.strokeWidth, index) : undefined,
          }
        })

      const regularValues: CrosshairCircle[] = yAccessors
        .map((a, index) => {
          const value = getNumber(datum, a)
          const yPixel = isNumber(value) ? this.yScale(value) : 0
          return {
            y: yPixel,
            opacity: isNumber(value) ? 1 : 0, // Hide circles with invalid values
            color: getColor(datum, this.config.color, stackedValues.length + index),
            strokeColor: this.config.strokeColor ? getColor(datum, this.config.strokeColor, index) : undefined,
            strokeWidth: this.config.strokeWidth ? getNumber(datum, this.config.strokeWidth, index) : undefined,
          }
        })

      return stackedValues.concat(regularValues)
    }

    // Return empty array if no data or no datum - crosshair line will still show
    return []
  }

  _updateFromSync (xData: number | Date | undefined): void {
    const { isActive, enableSync } = this._getSyncState()

    if (!enableSync || isActive) return

    // Handle mouse out signal
    if (xData === undefined) {
      this.show = false
      this._hideTooltip()
      return
    }

    if (!this.accessors.x || !this.datamodel.data?.length) return

    // Check if xPosition is within the chart's x domain
    const xDomain = this.xScale.domain()
    let xValue: number
    if (typeof xData === 'number') {
      xValue = xData
    } else if (xData instanceof Date) {
      xValue = xData.getTime()
    } else {
      this.show = false
      this._hideTooltip()
      return
    }

    // If xPosition is outside the chart's domain, hide the crosshair
    const domainMin = typeof xDomain[0] === 'number' ? xDomain[0] : (xDomain[0] instanceof Date ? xDomain[0].getTime() : 0)
    const domainMax = typeof xDomain[1] === 'number' ? xDomain[1] : (xDomain[1] instanceof Date ? xDomain[1].getTime() : 0)
    if (xValue < domainMin || xValue > domainMax) {
      this.show = false
      this._hideTooltip()
      return
    }

    // Find the datum at this x position
    if (typeof xData === 'number') {
      this.datum = getNearest(this.datamodel.data, xData, this.accessors.x)
    } else if (xData instanceof Date) {
      this.datum = getNearest(this.datamodel.data, xData.getTime(), this.accessors.x)
    } else {
      this.datum = undefined
    }
    this.datumIndex = this.datamodel.data.indexOf(this.datum)

    // If no datum found, hide the crosshair
    if (!this.datum) {
      this.show = false
      this._hideTooltip()
      return
    }

    const dataX = getNumber(this.datum, this.accessors.x, this.datumIndex)
    this.x = clamp(Math.round(this.xScale(dataX)), 0, this._width)
    this._currentXData = dataX

    // Show the crosshair
    this.show = true

    // Show tooltip for synchronized chart
    this._showTooltipForSync()
  }

  _showTooltipForSync (): void {
    const tooltip = this.config.tooltip ?? this.tooltip

    if (!tooltip || !this.show || !this.datum) return

    // Create a synthetic mouse event at the crosshair position
    const containerRect = this.container.node().getBoundingClientRect()
    const syntheticEvent = {
      clientX: containerRect.left + this.x,
      clientY: containerRect.top + this._height / 2,
    } as MouseEvent

    const [x, y] = tooltip.isContainerBody() ? [syntheticEvent.clientX, syntheticEvent.clientY] : [this.x, this._height / 2]
    const content = this.config.template(this.datum, this._currentXData || this.xScale.invert(this.x))

    tooltip.config.followCursor = true

    // Set tooltip placement based on Crosshair's position (left / right)
    if (!tooltip.config.horizontalPlacement || tooltip.config.horizontalPlacement === Position.Auto) {
      const xRelative = tooltip.isContainerBody() ? x - containerRect.left : x
      tooltip.overrideHorizontalPlacement(xRelative > this._containerWidth / 2 ? Position.Left : Position.Right)
    }

    if (content) {
      tooltip.show(content, { x, y })
    }
  }

  /**
   * Derive sync/active state based on mouse position and config
   * @returns { isActive: boolean, enableSync: boolean }
   */
  private _getSyncState (): { isActive: boolean; enableSync: boolean } {
    // A chart is active if it's being hovered and doesn't have external sync props
    const isActive = this._isMouseOver && !isNumber(this.config.xPosition) && !(this.config.xPosition instanceof Date) && !this.config.forceShow
    // A chart is in sync mode if it has external sync props (regardless of mouse state)
    const enableSync = isNumber(this.config.xPosition) || this.config.xPosition instanceof Date || !!this.config.forceShow
    return { isActive, enableSync }
  }
}
