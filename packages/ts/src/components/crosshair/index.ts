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

import { crosshairSyncBus, CrosshairSyncListener } from './sync-bus'

function isInDomain (x: number | Date | string, xDomain: (number | Date)[]): boolean {
  if (!Array.isArray(xDomain) || xDomain.length < 2) return false

  // Convert everything to numbers for comparison
  const xVal = typeof x === 'number' ? x : (x instanceof Date ? x.getTime() : new Date(x).getTime())
  const d0 = +xDomain[0]
  const d1 = +xDomain[xDomain.length - 1]

  return xVal >= d0 && xVal <= d1
}

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

  private _syncListener: CrosshairSyncListener | null = null
  private _isSyncActive = false // true if this chart is the one broadcasting

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

    // --- SYNC: subscribe if needed ---
    if (this.config.syncId) {
      this._syncListener = (x) => {
        if (!this._isSyncActive) {
          this._updateFromSync(x)
          window.requestAnimationFrame(() => this._render())
        }
      }
      crosshairSyncBus.subscribe(this.config.syncId, this._syncListener)
    }
  }

  _render (customDuration?: number): void {
    const { config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    // --- SYNC: update from sync bus if not active ---
    if (config.syncId && !this._isSyncActive) {
      // _updateFromSync is called by the bus
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
    // --- SYNC: unsubscribe if needed ---
    if (this.config.syncId && this._syncListener) {
      crosshairSyncBus.unsubscribe(this.config.syncId, this._syncListener)
      this._syncListener = null
    }
  }

  _onMouseMove (event: MouseEvent): void {
    const { config, datamodel, element } = this

    // Set sync active state
    this._isSyncActive = !!config.syncId

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

      // Emit to sync bus if configured
      if (config.syncId) {
        const xDomain = this.xScale.domain()
        if (isInDomain(dataX, xDomain)) {
          crosshairSyncBus.emit(config.syncId, dataX)
        } else {
          crosshairSyncBus.emit(config.syncId, undefined)
        }
      }
    } else {
      const tolerance = 2 // Show the crosshair when it is at least 2 pixels close to the chart area
      this.x = clamp(x, xRange[0], xRange[1])
      this._currentXData = this.xScale.invert(this.x)
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
    const { config } = this

    // If this chart is the sync broadcaster, emit undefined to the sync bus
    if (config.syncId && this._isSyncActive) {
      crosshairSyncBus.emit(config.syncId, undefined)
    }
    this._isSyncActive = false

    // Hide crosshair and tooltip
    this.show = false
    this._hideTooltip()

    window.cancelAnimationFrame(this._animFrameId)
    this._animFrameId = window.requestAnimationFrame(() => {
      this._render()
    })
  }

  _showTooltip (event?: MouseEvent): void {
    const { config } = this
    const tooltip = config.tooltip ?? this.tooltip

    if (!tooltip) {
      return
    }

    // For synchronized charts, we need to find the datum if it doesn't exist
    let datum = this.datum
    if (!datum && config.syncId && !this._isSyncActive && this._currentXData !== undefined) {
      // Find the datum at the current x position (only for number values)
      if (typeof this._currentXData === 'number') {
        datum = getNearest(this.datamodel.data, this._currentXData, this.accessors.x)
      }
    }

    if (!datum) {
      return
    }

    let x: number, y: number
    if (event) {
      // Use actual mouse event
      const container = tooltip.getContainer() || this.container.node()
      ;[x, y] = tooltip.isContainerBody() ? [event.clientX, event.clientY] : pointer(event, container)
    } else {
      // Use synthetic event for sync
      const containerRect = this.container.node().getBoundingClientRect()
      x = tooltip.isContainerBody() ? containerRect.left + this.x : this.x
      y = tooltip.isContainerBody() ? containerRect.top + this._height / 2 : this._height / 2
    }

    const content = config.template(datum, this._currentXData || this.xScale.invert(this.x))
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

  private getCircleData (): CrosshairCircle[] {
    const { config, datamodel: { data } } = this

    if (isFunction(config.getCircles)) return config.getCircles(this._currentXData || this.xScale.invert(this.x), data, this.yScale)

    // Get the datum - either from active mode or from synchronized mode
    let datum = this.datum
    let datumIndex = this.datumIndex

    if (!datum && config.syncId && !this._isSyncActive && this._currentXData !== undefined) {
      // Find the datum at the current x position (only for number values)
      if (typeof this._currentXData === 'number') {
        datum = getNearest(this.datamodel.data, this._currentXData, this.accessors.x)
        datumIndex = this.datamodel.data.indexOf(datum)
      }
    }

    if (config.snapToData && datum) {
      const yAccessors = this.accessors.y ?? []
      const yStackedAccessors = this.accessors.yStacked ?? []
      const baselineValue = getNumber(datum, this.accessors.baseline, datumIndex) || 0

      const stackedValues: CrosshairCircle[] = getStackedValues(datum, datumIndex, ...yStackedAccessors)
        .map((value, index) => {
          const yValue = value + baselineValue
          const yPixel = this.yScale(yValue)
          return {
            y: yPixel,
            opacity: 1,
            color: getColor(datum, config.color, index),
            strokeColor: config.strokeColor ? getColor(datum, config.strokeColor, index) : undefined,
            strokeWidth: config.strokeWidth ? getNumber(datum, config.strokeWidth, index) : undefined,
          }
        })

      const regularValues: CrosshairCircle[] = yAccessors
        .map((a, index) => {
          const value = getNumber(datum, a)
          const yPixel = isNumber(value) ? this.yScale(value) : 0
          return {
            y: yPixel,
            opacity: isNumber(value) ? 1 : 0, // Hide circles with invalid values
            color: getColor(datum, config.color, stackedValues.length + index),
            strokeColor: config.strokeColor ? getColor(datum, config.strokeColor, index) : undefined,
            strokeWidth: config.strokeWidth ? getNumber(datum, config.strokeWidth, index) : undefined,
          }
        })

      return stackedValues.concat(regularValues)
    }

    // Return empty array if no data or no datum - crosshair line will still show
    return []
  }

  _updateFromSync (xData: number | Date | undefined): void {
    const { config, datamodel } = this

    if (!config.syncId || this._isSyncActive) {
      return
    }

    // Handle mouse out signal
    if (xData === undefined) {
      this.show = false
      this._hideTooltip()
      return
    }

    if (!this.accessors.x || !datamodel.data?.length) {
      return
    }

    // --- DOMAIN CHECK (on passive chart, use xData directly) ---
    const xDomain = this.xScale.domain()
    if (!isInDomain(xData, xDomain)) {
      this.show = false
      this._hideTooltip()
      return
    }
    // --- END DOMAIN CHECK ---

    // Find the datum at this x position
    if (typeof xData === 'number') {
      this.datum = getNearest(datamodel.data, xData, this.accessors.x)
    } else if (xData instanceof Date || typeof xData === 'string') {
      const xVal = xData instanceof Date ? xData.getTime() : new Date(xData).getTime()
      this.datum = getNearest(datamodel.data, xVal, this.accessors.x)
    } else {
      this.datum = undefined
    }
    this.datumIndex = datamodel.data.indexOf(this.datum)

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
    this._showTooltip()
  }
}
