import { Selection, pointer, select } from 'd3-selection'
import { easeLinear } from 'd3-ease'
import { least, bisectLeft, bisectRight, extent } from 'd3-array'

// Core
import { XYComponentCore } from '@/core/xy-component'
import { Tooltip } from '@/components/tooltip'
import type { Zoom } from '@/components/zoom'

// Utils
import { isNumber, isArray, getNumber, clamp, getStackedValues, getNearest2D, isFunction } from '@/utils/data'
import { smartTransition } from '@/utils/d3'
import { getColor } from '@/utils/color'

// Types
import { Position } from '@/types/position'
import { FindNearestDirection } from '@/types/data'
import { Spacing } from '@/types/spacing'

// Local Types
import { CrosshairAccessors, CrosshairCircle, CrosshairSeries, CrosshairTickFormats } from './types'
import {
  CrosshairSnapMode,
  CROSSHAIR_CIRCLE_OVERLAP_RADII,
  CROSSHAIR_ACTIVE_CIRCLE_RADIUS_SCALE,
  CROSSHAIR_KEYBOARD_PAGE_FRACTION,
  CROSSHAIR_KEYBOARD_PAN_PADDING,
} from './constants'

// Local Utils
import { getTextContent } from './utils'

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
  lineHorizontal: Selection<SVGLineElement, any, SVGElement, any>
  private _xPx: number | undefined = undefined
  private _yPx: number | undefined = undefined
  private _mouseEvent: MouseEvent | undefined = undefined
  private _animFrameId: number = null
  // Keyboard navigation state, see `showAtDatum`
  private _keyboardDatumIndex: number | undefined = undefined
  private _keyboardSeriesId: string | undefined = undefined
  private _keyboardEvent: KeyboardEvent | undefined = undefined
  /** The last data point navigated to with the keyboard, to continue from */
  private _lastKeyboardDatumIndex: number | undefined = undefined
  private _isKeyboardCrosshairShown = false
  private _liveRegion: Selection<HTMLDivElement, unknown, null, undefined> | undefined

  /** Zoom of the container, so keyboard navigation can pan the chart. Set by XYContainer */
  public zoom: Zoom<Datum> | undefined
  /** Tick formats of the axes, used in the screen reader announcements. Set by XYContainer */
  public tickFormats: CrosshairTickFormats = {}

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

  private _colorKeys: string[] = []
  public set colorKeys (colorKeys: string[]) { this._colorKeys = colorKeys }
  public get colorKeys (): string[] { return this.config.colorKeys ?? this._colorKeys }

  /** Data indices sorted by x value with the corresponding sorted values, so per-mousemove
   * nearest-datum lookups can bisect instead of re-sorting the dataset on every frame.
   * Invalidated when the data, config, or externally provided accessors change */
  private _sortedDataCache: { values: number[]; indices: number[] } | null = null

  public set accessors (accessors: CrosshairAccessors<Datum>) {
    this._accessors = accessors
    this._sortedDataCache = null
  }

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

    // Container must be at least `visibilityThreshold` (default 35%) visible
    return containerArea > 0 && (visibleArea / containerArea) >= this.config.visibilityThreshold
  }

  constructor (config?: CrosshairConfigInterface<Datum>) {
    super()
    this.setConfig(config)

    this.g.style('opacity', 0)
    this.line = this.g.append('line')
      .attr('class', s.line)
    this.lineHorizontal = this.g.append('line')
      .attr('class', s.lineHorizontal)
      .style('display', 'none')
  }

  public createTooltip (): Tooltip {
    return new Tooltip()
  }

  get bleed (): Spacing {
    const { config: { circleRadius } } = this

    // We leave the bottom bleed empty because usually the crosshair is used along with the X axis,
    // so we don't need extra space at the bottom. For inverted charts, the users will need to specify
    // the container margins themselves to avoid the crosshair circles from being cut off.
    return { top: circleRadius, left: circleRadius, right: circleRadius }
  }

  setContainer (containerSvg: Selection<SVGSVGElement, unknown, SVGSVGElement, unknown>): void {
    if (this.container === containerSvg) return

    this.container = containerSvg
    this.container.on('pointermove.crosshair', this._onPointerMove.bind(this))
    this.container.on('pointerout.crosshair', this._onPointerOut.bind(this))
    this.container.on('wheel.crosshair', this._onWheel.bind(this))
    // A touch shows the crosshair only while the finger is down
    this.container.on('pointerdown.crosshair', this._onPointerDown.bind(this))
    this.container.on('pointerup.crosshair pointercancel.crosshair', this._onPointerUp.bind(this))
    this._updateLiveRegion()
  }

  setData (data: Datum[]): void {
    super.setData(data)
    this._sortedDataCache = null
    this._lastKeyboardDatumIndex = undefined
    this._isKeyboardCrosshairShown = false
  }

  /** The series that have a value at the datum, ordered from top to bottom.
   * Requires `snapToData` and is empty otherwise */
  private _getSeries (datumIndex: number): CrosshairSeries[] {
    const datum = this.datamodel.data?.[datumIndex]
    if (datum === undefined) return []

    return this.getCircleData(datum, datumIndex)
      .filter(c => c.opacity !== 0 && isFinite(c.y))
      .sort((a, b) => a.y - b.y)
      .map(({ id, index, value, y }) => ({ id, index, value, y }))
  }

  /** Shows the crosshair at the datum (for example, when navigating the chart with the keyboard),
   * optionally highlighting the series with the provided id (see `getSeries`). Any pointer movement or `hide()` resets it */
  public showAtDatum (datumIndex: number, seriesId?: string, event?: KeyboardEvent): void {
    this._keyboardSeriesId = seriesId
    this._renderAtDatum(datumIndex, event)
  }

  private _renderAtDatum (datumIndex: number, event?: KeyboardEvent): void {
    this._keyboardDatumIndex = datumIndex
    this._keyboardEvent = event
    this._xPx = undefined
    this._yPx = undefined
    this._mouseEvent = undefined

    window.cancelAnimationFrame(this._animFrameId)
    this._animFrameId = window.requestAnimationFrame(() => this._render())
  }

  private _resetKeyboardState (): void {
    this._keyboardDatumIndex = undefined
    this._keyboardEvent = undefined
  }

  /** Sets up the live region for the keyboard navigation announcements in the container's element */
  private _updateLiveRegion (): void {
    const element = this.container?.node().parentElement
    if (this.config.keyboardNavigation && element) {
      if (this._liveRegion?.node().parentElement !== element) {
        this._liveRegion?.remove()
        this._liveRegion = select(element).append('div')
          .attr('class', s.liveRegion)
          .attr('aria-live', 'polite')
          .attr('aria-atomic', true)
      }
    } else {
      this._liveRegion?.remove()
      this._liveRegion = undefined
    }
  }

  /** Indices of the data that keyboard navigation can reach, sorted by the x value:
   * the ones within the zoom extent when the chart has a Zoom, or within the X domain otherwise */
  private _getNavigableDataIndices (): number[] {
    const data = this.datamodel.data ?? []
    const domain = this.zoom ? this.zoom.getExtent() : this.xScale?.domain().map(Number)
    if (!domain) return []

    const [min, max] = extent(domain)
    return this._getSortedData().indices.filter(i => {
      const x = getNumber(data[i], this.accessors.x, i)
      return x >= min && x <= max
    })
  }

  /** Handles the keyboard navigation keys of the focused chart. Called by XYContainer */
  onKeyDown (event: KeyboardEvent): void {
    if (!this.config.keyboardNavigation || event.defaultPrevented) return

    const indices = this._getNavigableDataIndices()
    if (!indices.length) return

    const last = indices.length - 1
    const currentPosition = indices.indexOf(this._lastKeyboardDatumIndex)
    const position = this._isKeyboardCrosshairShown && currentPosition !== -1 ? currentPosition : undefined
    const pageStep = Math.max(1, Math.round(indices.length * CROSSHAIR_KEYBOARD_PAGE_FRACTION))
    let newPosition: number
    switch (event.key) {
      case 'ArrowRight': newPosition = position === undefined ? 0 : position + 1; break
      case 'ArrowLeft': newPosition = position === undefined ? last : position - 1; break
      case 'PageDown': newPosition = (position ?? -1) + pageStep; break
      case 'PageUp': newPosition = (position ?? last + 1) - pageStep; break
      case 'Home': newPosition = 0; break
      case 'End': newPosition = last; break
      case 'ArrowUp':
      case 'ArrowDown': {
        // The series are ordered from top to bottom
        newPosition = position ?? 0
        const series = this._getSeries(indices[newPosition])
        if (!series.length) return

        const i = series.findIndex(d => d.id === this._keyboardSeriesId)
        const next = event.key === 'ArrowUp' ? (i === -1 ? series.length - 1 : i - 1) : (i === -1 ? 0 : i + 1)
        this._keyboardSeriesId = series[clamp(next, 0, series.length - 1)].id
        break
      }
      case 'Escape':
        if (!this._isKeyboardCrosshairShown) return
        this._isKeyboardCrosshairShown = false
        this._keyboardSeriesId = undefined
        this._liveRegion?.text('')
        this.hide(event)
        event.preventDefault()
        return
      default:
        return
    }

    event.preventDefault()
    this._showKeyboardDatum(indices[clamp(newPosition, 0, last)], event)
  }

  /** X value of the data point the Crosshair has been moved to with the keyboard, if it's shown.
   * The `+` and `-` keys zoom around it */
  getKeyboardX (): number | undefined {
    const datumIndex = this._lastKeyboardDatumIndex
    if (!this._isKeyboardCrosshairShown || datumIndex === undefined) return undefined
    return getNumber(this.datamodel.data[datumIndex], this.accessors.x, datumIndex)
  }

  /** Shows the Crosshair when the chart gets focused with the keyboard (not on click). Called by XYContainer */
  onFocus (): void {
    const element = this.container?.node().parentElement
    if (!this.config.keyboardNavigation || !element?.matches(':focus-visible')) return

    const indices = this._getNavigableDataIndices()
    const datumIndex = indices.includes(this._lastKeyboardDatumIndex) ? this._lastKeyboardDatumIndex : indices[0]
    if (datumIndex !== undefined) this._showKeyboardDatum(datumIndex)
  }

  /** Called by XYContainer when the chart loses focus */
  onBlur (): void {
    if (!this._isKeyboardCrosshairShown) return

    this._isKeyboardCrosshairShown = false
    this._liveRegion?.text('')
    this.hide()
  }

  private _showKeyboardDatum (datumIndex: number, event?: KeyboardEvent): void {
    const datum = this.datamodel.data[datumIndex]
    const x = getNumber(datum, this.accessors.x, datumIndex)
    // The highlighted series is remembered even when it doesn't have a value at this data point
    const series = this._getSeries(datumIndex).find(d => d.id === this._keyboardSeriesId)

    // Pan the zoomed chart to keep the data point visible
    const domain = this.zoom?.getDomain()
    if (domain && (x < domain[0] || x > domain[1])) {
      const padding = (domain[1] - domain[0]) * CROSSHAIR_KEYBOARD_PAN_PADDING
      const shift = x < domain[0] ? x - padding - domain[0] : x + padding - domain[1]
      this.zoom.setDomain([domain[0] + shift, domain[1] + shift], event)
    }

    this._lastKeyboardDatumIndex = datumIndex
    this._isKeyboardCrosshairShown = true
    this._renderAtDatum(datumIndex, event)
    this._liveRegion?.text(this._getKeyboardAnnouncement(datum, datumIndex, x, series))
  }

  private _getKeyboardAnnouncement (datum: Datum, datumIndex: number, x: number, series: CrosshairSeries | undefined): string {
    const { config, tickFormats } = this
    const xValue = this.xScale.invert(this.xScale.range()[0]) instanceof Date ? new Date(x) : x
    if (config.keyboardAnnouncement) return config.keyboardAnnouncement(xValue, datum, datumIndex, series?.index)

    const xText = tickFormats.x?.(xValue, 0, [xValue] as number[] | Date[]) ?? xValue.toLocaleString()
    const formatY = (y: number): string => tickFormats.y?.(y, 0, [y]) ?? y.toLocaleString()
    if (series) {
      const seriesCount = (this.accessors.yStacked?.length ?? 0) + (this.accessors.y?.length ?? 0)
      return `${xText}, series ${series.index + 1} of ${seriesCount}: ${formatY(series.value)}`
    }

    const templateText = getTextContent(config.template(datum, x, this.datamodel.data, datumIndex))
    if (templateText) return templateText

    const values = this._getSeries(datumIndex).sort((a, b) => a.index - b.index).map(d => formatY(d.value))
    return values.length ? `${xText}: ${values.join(', ')}` : xText
  }

  setConfig (config: CrosshairConfigInterface<Datum>): void {
    super.setConfig(config)
    this._updateLiveRegion()
    this._sortedDataCache = null
  }

  private _getSortedData (): { values: number[]; indices: number[] } {
    if (!this._sortedDataCache) {
      const data = this.datamodel.data ?? []
      const x = this.accessors.x
      const indices = data.map((_, i) => i)
        .sort((a, b) => getNumber(data[a], x, a) - getNumber(data[b], x, b))
      const values = indices.map(i => getNumber(data[i], x, i))
      this._sortedDataCache = { values, indices }
    }

    return this._sortedDataCache
  }

  /** Returns the index (in the original data array) of the datum with the x value nearest
   * to the provided one, bisecting over the sorted x values cache */
  private _getNearestDatumIndex (value: number, direction: FindNearestDirection = FindNearestDirection.Auto): number | undefined {
    const data = this.datamodel.data
    if (!data?.length || !this.accessors.x) return undefined
    if (data.length === 1) return 0

    const { values, indices } = this._getSortedData()
    const index = direction === FindNearestDirection.Right
      ? bisectLeft(values, value, 0, data.length - 1)
      : bisectRight(values, value, 1, data.length)

    if (direction === FindNearestDirection.Right) return indices[index]
    if (direction === FindNearestDirection.Left) return indices[index - 1]

    // By default (`FindNearestDirection.Auto`) return the index of the nearest value
    return value - values[index - 1] > values[index] - value ? indices[index] : indices[index - 1]
  }

  _render (customDuration?: number): void {
    const { config, datamodel } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    const isForceShowAtDefined = config.forceShowAt !== undefined
    const keyboardDatumIndex = isForceShowAtDefined ? undefined : this._keyboardDatumIndex
    const keyboardDatum = keyboardDatumIndex === undefined ? undefined : datamodel.data?.[keyboardDatumIndex]
    const isKeyboardActive = keyboardDatum !== undefined
    const xPx = isForceShowAtDefined
      ? this.xScale(config.forceShowAt)
      : isKeyboardActive ? this.xScale(getNumber(keyboardDatum, this.accessors.x, keyboardDatumIndex)) : this._xPx

    const xValue = this.xScale.invert(xPx) as number

    const leftNearestDatumIndex = this._getNearestDatumIndex(xValue, FindNearestDirection.Left)

    // If `snapToData` is `true`, we need to find the nearest datum to the crosshair
    // It can be from a mouse interaction or from a `forceShowAt` setting
    let nearestDatum: Datum | undefined
    let nearestDatumIndex: number | undefined
    // Squared pixel distance from the pointer to the snapped datum (only set in `CrosshairSnapMode.XY` mode).
    // Feeds the `nearestDistance` calculation below.
    let nearestDistanceSq: number | undefined
    if (config.snapToData) {
      if (!this.accessors.y && !this.accessors.yStacked && datamodel.data?.length) {
        console.warn('Unovis | Crosshair: Y accessors have not been configured. Please check if they\'re present in the configuration object')
      }

      // Emit a warning if there's no data to snap to.
      // To keep the console clean, only emit the warning when there's mouse interaction.
      if (!datamodel.data?.length && this._mouseEvent) {
        console.warn('Unovis | Crosshair: No data to snap to. Make sure the data has been passed to the container or to the crosshair itself')
      }

      // In `CrosshairSnapMode.XY` mode we snap to the data point closest to the pointer in both X and Y (pixel space).
      // This requires a real pointer position, so we fall back to X-only snapping when `forceShowAt` is set
      // or there's no pointer Y available yet.
      const useXYMode = config.snapMode === CrosshairSnapMode.XY && !isForceShowAtDefined && this._yPx !== undefined
      if (isKeyboardActive) {
        nearestDatum = keyboardDatum
        nearestDatumIndex = keyboardDatumIndex
      } else if (useXYMode) {
        const nearest = getNearest2D(datamodel.data, [this._xPx, this._yPx], this.xScale, this.yScale, this.accessors.x, this.accessors.y, this.accessors.yStacked, this.accessors.baseline)
        if (nearest) {
          nearestDatum = nearest.datum
          nearestDatumIndex = nearest.index
          nearestDistanceSq = nearest.distanceSq
        }
      } else {
        nearestDatumIndex = this._getNearestDatumIndex(xValue)
        nearestDatum = nearestDatumIndex === undefined ? undefined : datamodel.data[nearestDatumIndex]
      }
    }

    const xRange = this.xScale.range()
    const yRange = this.yScale.range()
    const xClamped = config.snapToData && nearestDatum
      ? clamp(Math.round(this.xScale(getNumber(nearestDatum, this.accessors.x, nearestDatumIndex))), 0, this._width)
      : clamp(xPx, xRange[0], xRange[1])

    const isCrosshairWithinXRange = (xPx >= xRange[0]) && (xPx <= xRange[1])
    const isCrosshairWithinYRange = (this._yPx >= Math.min(yRange[0], yRange[1])) && (this._yPx <= Math.max(yRange[0], yRange[1]))
    let shouldShow = isKeyboardActive ? isCrosshairWithinXRange
      : config.skipRangeCheck ? !!this._xPx : (this._xPx ? isCrosshairWithinXRange && isCrosshairWithinYRange : isCrosshairWithinXRange)

    // Distance in pixels between the pointer and the snapped datum: the full 2D distance in
    // `CrosshairSnapMode.XY` mode (so a point that's close in X but far in Y still counts as far),
    // or the horizontal distance to the crosshair line otherwise
    const nearestDistance = nearestDistanceSq !== undefined ? Math.sqrt(nearestDistanceSq) : Math.abs(xClamped - (+xPx))

    // If the crosshair is far from the mouse pointer (usually when `snapToData` is `true` and data resolution is low), hide it
    if (config.hideWhenFarFromPointer && (nearestDistance >= config.hideWhenFarFromPointerDistance)) {
      shouldShow = false
    }

    // The circle of the series highlighted with the keyboard
    const activeCircle = isKeyboardActive && this._keyboardSeriesId !== undefined
      ? this.getCircleData(nearestDatum, nearestDatumIndex).find(c => c.id === this._keyboardSeriesId)
      : undefined

    const tooltip = config.tooltip ?? this.tooltip
    if (shouldShow && tooltip && this._isContainerInViewport()) {
      const container = tooltip.getContainer() || this.container.node()
      const isContainerBody = tooltip.isContainerBody()
      const nearestDatumXValue = (this.accessors.x && nearestDatum !== undefined) ? getNumber(nearestDatum, this.accessors.x, nearestDatumIndex) : undefined
      const tooltipXValue = nearestDatumXValue ?? xValue

      if (isForceShowAtDefined || isKeyboardActive) {
        // Convert SVG coordinates to screen coordinates
        const containerRect = this.container.node().getBoundingClientRect()

        // Use the actual left margin from the container
        const screenX = (isContainerBody ? xPx + containerRect.left : xPx) + this._containerMargin.left
        const y = activeCircle ? activeCircle.y + this._containerMargin.top : this._height / 2
        const screenY = y + (isContainerBody ? containerRect.top : 0)
        const pos = [screenX, screenY] as [number, number]
        this._showTooltip(nearestDatum, tooltipXValue, pos, leftNearestDatumIndex)
      } else if (this._mouseEvent) {
        const pos = (isContainerBody ? [this._mouseEvent.clientX, this._mouseEvent.clientY] : pointer(this._mouseEvent, container)) as [number, number]
        this._showTooltip(nearestDatum, tooltipXValue, pos, leftNearestDatumIndex)
      }
    } else this._hideTooltip()

    // Trigger `onCrosshairMove` if the render was triggered by a pointer move or a keyboard event
    const sourceEvent = this._mouseEvent ?? this._keyboardEvent
    if (sourceEvent) {
      // With `forceShowAt`, we report the pointer position, so it can drive `forceShowAt` (e.g. to sync multiple charts)
      const reportedXPx = isKeyboardActive ? xPx : this._xPx
      config.onCrosshairMove?.(shouldShow ? this.xScale.invert(reportedXPx) as number : undefined, nearestDatum, nearestDatumIndex, sourceEvent)
      this._mouseEvent = undefined
      this._keyboardEvent = undefined
    }

    smartTransition(this.g, duration)
      .style('opacity', shouldShow ? 1 : 0)

    // When `config.forceShowAt` becomes `undefined`, the crosshair "jumps" to the edge of the chart.
    // This looks off, so we stop further rendering when the `xPx` value is not finite.
    if (!isFinite(xPx)) return

    const circleData = isFunction(config.getCircles)
      ? config.getCircles(xValue, datamodel.data, this.yScale, leftNearestDatumIndex)
      : this.getCircleData(nearestDatum, nearestDatumIndex)

    this.line
      .attr('y1', 0)
      .attr('y2', this._height)

    smartTransition(this.line, duration, easeLinear)
      .attr('x1', xClamped)
      .attr('x2', xClamped)

    const lineHorizontalY = config.showHorizontalLine ? this.getLineHorizontalY(circleData, activeCircle?.y ?? this._yPx) : undefined
    this.lineHorizontal
      .style('display', lineHorizontalY === undefined ? 'none' : null)
      .attr('x1', 0)
      .attr('x2', this._width)

    if (lineHorizontalY !== undefined) {
      smartTransition(this.lineHorizontal, duration, easeLinear)
        .attr('y1', lineHorizontalY)
        .attr('y2', lineHorizontalY)
    }

    const circles = this.g
      .selectAll<SVGCircleElement, CrosshairCircle>('circle')
      .data(this.getPaintOrder(circleData), (d, i) => d.id ?? i)

    const circlesEnter = circles.enter()
      .append('circle')
      .attr('class', s.circle)
      .attr('r', 0)
      .attr('cx', xClamped)
      .attr('cy', d => d.y)
      .style('fill', d => d.color)
      .style('stroke', d => d.strokeColor)
      .style('stroke-width', d => d.strokeWidth)

    // The join keeps the existing nodes where they are, so we re-insert them to follow the paint order
    const circlesMerged = circlesEnter.merge(circles).order()
    smartTransition(circlesMerged, duration, easeLinear)
      .attr('cx', xClamped)
      .attr('cy', d => d.y)
      .attr('r', d => d.id === activeCircle?.id ? config.circleRadius * CROSSHAIR_ACTIVE_CIRCLE_RADIUS_SCALE : config.circleRadius)
      .style('opacity', d => d.opacity)
      .style('fill', d => d.color)
      .style('stroke', d => d.strokeColor)
      .style('stroke-width', d => d.strokeWidth)

    smartTransition(circles.exit(), duration, easeLinear)
      .attr('r', 0)
      .style('opacity', 0)
      .remove()
      .on('interrupt', function () { this.remove() })
  }

  hide (sourceEvent?: MouseEvent | WheelEvent | KeyboardEvent): void {
    window.cancelAnimationFrame(this._animFrameId)
    this._resetKeyboardState()
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

  _onPointerMove (event: PointerEvent): void {
    // Ignore all the fingers except the first one
    if (event.pointerType === 'touch' && !event.isPrimary) return

    const { datamodel, element } = this
    if (!this.accessors.x && datamodel.data?.length) {
      console.warn('Unovis | Crosshair: X accessor function has not been configured. Please check if it\'s present in the configuration object')
    }
    const [x, y] = pointer(event, element)
    this._xPx = x
    this._yPx = y
    this._mouseEvent = event
    this._resetKeyboardState()

    window.cancelAnimationFrame(this._animFrameId)
    this._animFrameId = window.requestAnimationFrame(() => {
      // We'll call `config.onCrosshairMove` in `_render` with the found `nearestDatum` and `nearestDatumIndex`,
      // which can come from the mouse interaction or from the `forceShowAt` setting
      this._render()
    })
  }

  _onPointerOut (event?: PointerEvent): void {
    if (event?.pointerType === 'touch' && !event.isPrimary) return

    // Safari fires the boundary events of touches and pens without `relatedTarget`, so we look up the element under the pointer
    const root = this.container?.node().getRootNode() as Document | ShadowRoot
    const isDirectPointer = event?.pointerType === 'touch' || event?.pointerType === 'pen'
    const relatedTarget = event?.relatedTarget ?? (isDirectPointer && isFunction(root?.elementFromPoint)
      ? root.elementFromPoint(event.clientX, event.clientY)
      : null)

    // Only hide if the pointer actually left the SVG, not just moved to a child
    if (!event || !this.container?.node().contains(relatedTarget as Node)) {
      this.hide(event)
    }
  }

  _onPointerDown (event: PointerEvent): void {
    // Mouse shows the crosshair on `pointermove` (hover), while a touch or a pen (it can't always hover) shows it right away
    if (event.pointerType === 'touch' || event.pointerType === 'pen') this._onPointerMove(event)
  }

  _onPointerUp (event: PointerEvent): void {
    // `pointercancel` is fired when the browser takes over the gesture, e.g. to scroll the page
    if (event.isPrimary && (event.pointerType === 'touch' || event.type === 'pointercancel')) this.hide(event)
  }

  _onWheel (event: WheelEvent): void {
    // When the wheel zooms or pans the chart (the container prevents its default action), the crosshair stays under the pointer
    if (event.defaultPrevented) this._onPointerMove(event as unknown as PointerEvent)
    else this.hide(event)
  }

  protected _onDestroy (): void {
    window.cancelAnimationFrame(this._animFrameId)
    this.container?.on('.crosshair', null)
    this._liveRegion?.remove()
  }

  _showTooltip (datum: Datum | undefined, xValue: number, pos: [number, number], nearestDatumIndex: number | undefined): void {
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

  /** Y position of the horizontal crosshair line: the circle closest to the pointer (i.e. the snapped data point),
   * or the pointer position itself when there are no circles to snap to. `undefined` when there's nothing to draw */
  private getLineHorizontalY (circles: CrosshairCircle[], yPx: number | undefined): number | undefined {
    const circleYs = circles.filter(c => c.opacity !== 0 && isFinite(c.y)).map(c => c.y)
    const y = (yPx === undefined ? circleYs[0] : least(circleYs, cy => Math.abs(cy - yPx))) ?? yPx
    return isFinite(y) ? clamp(Math.round(y), 0, this._height) : undefined
  }

  /** Returns the circles in the order they should be painted. Among the circles that overlap each other
   * (their Y positions are within `2 * circleRadius`), the one with the largest magnitude goes last,
   * so a thin stacked segment doesn't cover the thick one. The other circles keep their order */
  private getPaintOrder (circles: CrosshairCircle[]): CrosshairCircle[] {
    const maxDistance = CROSSHAIR_CIRCLE_OVERLAP_RADII * this.config.circleRadius
    const order = circles.map((_, i) => i)
    const candidates = order
      .filter(i => circles[i].opacity !== 0 && isFinite(circles[i].y) && isNumber(circles[i].magnitude))
      .sort((a, b) => circles[a].y - circles[b].y)

    // Group the circles into chains where each one is within `maxDistance` of the previous one
    const clusters: number[][] = []
    for (const i of candidates) {
      const cluster = clusters[clusters.length - 1]
      if (cluster && circles[i].y - circles[cluster[cluster.length - 1]].y <= maxDistance) cluster.push(i)
      else clusters.push([i])
    }

    for (const cluster of clusters) {
      if (cluster.length < 2) continue
      const largest = cluster.reduce((a, b) => (circles[b].magnitude > circles[a].magnitude ? b : a))
      const lastPosition = Math.max(...cluster.map(i => order.indexOf(i)))
      const position = order.indexOf(largest)
      if (position === lastPosition) continue
      order.splice(position, 1)
      order.splice(lastPosition, 0, largest)
    }

    return order.map(i => circles[i])
  }

  private getCircleData (datum: Datum, datumIndex: number): (CrosshairCircle & Pick<CrosshairSeries, 'index' | 'value'>)[] {
    const { config } = this
    const colorOptions = { colorFn: this._colorFunction }
    const colorKeys = this.colorKeys

    if (config.snapToData && datum) {
      const yAccessors = this.accessors.y ?? []
      const yStackedAccessors = this.accessors.yStacked ?? []
      const baselineValue = getNumber(datum, this.accessors.baseline, datumIndex) || 0
      const stackedValues = getStackedValues(datum, datumIndex, ...yStackedAccessors)
        .map((value, index) => ({
          id: `stacked-${index}`,
          index,
          value: getNumber(datum, yStackedAccessors[index], datumIndex),
          y: this.yScale(value + baselineValue),
          opacity: isNumber(getNumber(datum, yStackedAccessors[index], datumIndex)) ? 1 : 0,
          magnitude: Math.abs(getNumber(datum, yStackedAccessors[index], datumIndex)),
          color: getColor(datum, config.color, index, colorKeys?.[index], colorOptions),
          strokeColor: config.strokeColor ? getColor(datum, config.strokeColor, index, colorKeys?.[index], colorOptions) : undefined,
          strokeWidth: config.strokeWidth ? getNumber(datum, config.strokeWidth, index) : undefined,
        }))

      const regularValues = yAccessors
        .map((a, index) => {
          const value = getNumber(datum, a, datumIndex)
          const circleIndex = stackedValues.length + index
          return {
            id: `regular-${index}`,
            index: circleIndex,
            value,
            y: this.yScale(value),
            opacity: isNumber(value) ? 1 : 0,
            magnitude: Math.abs(value),
            color: getColor(datum, config.color, circleIndex, colorKeys?.[circleIndex], colorOptions),
            strokeColor: config.strokeColor ? getColor(datum, config.strokeColor, circleIndex, colorKeys?.[circleIndex], colorOptions) : undefined,
            strokeWidth: config.strokeWidth ? getNumber(datum, config.strokeWidth, circleIndex) : undefined,
          }
        })

      return stackedValues.concat(regularValues).filter(d => isNumber(d.y))
    }

    return []
  }
}
