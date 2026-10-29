import { Selection } from 'd3-selection'

// Core
import { XYComponentCore } from '@/core/xy-component'

// Utils
import { clamp, getNumber, isNumber } from '@/utils/data'

// Types
import { ContinuousScale } from '@/types/scale'

// Local Types
import { ZoomContainerHooks } from './types'

// Local Utils
import { constrainDomain, getMinStep, transformDomain } from './utils'

// Constants
import {
  ZOOM_AUTO_MIN_SPAN_STEPS,
  ZOOM_DRAG_THRESHOLD_PX,
  ZOOM_KEYBOARD_FACTOR,
  ZOOM_PINCH_WHEEL_MULTIPLIER,
  ZOOM_WHEEL_DELTA_MULTIPLIERS,
  ZOOM_WHEEL_MAX_EXPONENT,
  ZOOM_WHEEL_PAN_MULTIPLIERS,
} from './constants'

// Config
import { ZoomDefaultConfig, ZoomConfigInterface } from './config'

// Styles
import * as s from './style'

/** Zooming and panning of XY charts along the X axis. Add it to an XY Container via the `zoom` property:
 * the mouse wheel zooms once the chart has been clicked or focused, a horizontal scroll and a mouse drag pan,
 * trackpad pinch and `Ctrl` / `⌘` + wheel zoom right away, two fingers pinch and pan on touch screens,
 * `+` / `-` zoom the focused chart and double click resets the zoom */
export class Zoom<Datum> extends XYComponentCore<Datum, ZoomConfigInterface<Datum>> {
  static selectors = s
  clippable = false
  protected _defaultConfig = ZoomDefaultConfig as ZoomConfigInterface<Datum>
  public config: ZoomConfigInterface<Datum> = this._defaultConfig
  container: Selection<SVGSVGElement, unknown, null, undefined>

  private _hooks: ZoomContainerHooks | undefined
  private _components: XYComponentCore<Datum>[] = []
  /** X domain set by zooming and panning. When `undefined`, the container's domain is used */
  private _domain: [number, number] | undefined
  /** X domain without the zoom (from the container's `xDomain` or the data), updated on every render */
  private _unzoomedDomain: [number, number] | undefined
  /** Limits of zooming out and panning, updated on every render */
  private _extent: [number, number] | undefined
  /** Automatic minimum span of the zoomed domain, calculated lazily once per render (`null` when not calculated yet) */
  private _autoMinSpan: number | undefined | null = null
  private _drag: { pointerId: number; startPx: number; scale: ContinuousScale; isActive: boolean } | undefined
  private _touches = new Map<number, [number, number]>()
  private _pinch: { scale: ContinuousScale; fromPx: number; distance: number } | undefined

  constructor (config?: ZoomConfigInterface<Datum>) {
    super()
    this.setConfig(config)
  }

  /** Sets up the gestures on the container's SVG, or removes them when `containerSvg` is `undefined`.
   * This method is supposed to be called by the XY Container */
  setContainer (containerSvg: Selection<SVGSVGElement, unknown, null, undefined> | undefined, hooks?: ZoomContainerHooks): void {
    this._hooks = hooks
    if (this.container === containerSvg) return

    this.container?.on('.xy-zoom', null)
    this.container = containerSvg
    if (!containerSvg) return

    // The wheel and the pointer moves are captured, so the Crosshair can tell if a wheel event zoomed the chart
    // and a pinch can keep the events from reaching the Crosshair and the Tooltip
    this.container
      .on('wheel.xy-zoom', this._onWheel.bind(this), { capture: true, passive: false })
      .on('pointermove.xy-zoom', this._onPointerMove.bind(this), { capture: true })
      .on('pointerdown.xy-zoom', this._onPointerDown.bind(this))
      .on('pointerup.xy-zoom pointercancel.xy-zoom', this._onPointerUp.bind(this))
      .on('dblclick.xy-zoom', this._onDoubleClick.bind(this))
  }

  /** The components whose data defines the automatic minimum span. Set by the XY Container */
  setComponents (components: XYComponentCore<Datum>[]): void {
    this._components = components
    this._autoMinSpan = null
  }

  /** Returns the X domain to render. Called by the XY Container on every render with the domain
   * calculated without the zoom and the extent of the data */
  getZoomedDomain (domain: [number, number], dataExtent: [number | undefined, number | undefined]): [number, number] {
    const { config } = this
    this._autoMinSpan = null
    this._unzoomedDomain = [domain[0], domain[1]]
    this._extent = [
      config.extent?.[0] ?? Math.min(domain[0], dataExtent[0] ?? domain[0]),
      config.extent?.[1] ?? Math.max(domain[1], dataExtent[1] ?? domain[1]),
    ]

    if (!this._domain) return domain
    this._domain = constrainDomain(this._domain, this._extent, this._getMinSpan())
    return this._domain
  }

  /** The visible X domain, which may not have been rendered yet */
  getDomain (): [number, number] | undefined {
    return this._domain ?? this._unzoomedDomain
  }

  /** Limits of zooming out and panning */
  getExtent (): [number, number] | undefined {
    return this._extent
  }

  /** Zooms or pans the chart to the provided X domain, limited by the extent and the minimum span.
   * When the span gets limited, `anchor` (a value within the domain) keeps its relative position */
  setDomain (domain: [number, number], event?: WheelEvent | PointerEvent | MouseEvent | KeyboardEvent, anchor?: number, animate = false): void {
    if (!this._extent || !domain.every(isFinite)) return

    const newDomain = constrainDomain(domain, this._extent, this._getMinSpan(), anchor)
    const currentDomain = this.getDomain()
    if (newDomain[0] === currentDomain?.[0] && newDomain[1] === currentDomain?.[1]) return

    this._domain = newDomain
    this.config.onZoom?.(newDomain, event)
    this._hooks?.render(animate)
  }

  /** Zooms by `factor` (`> 1` zooms in) around the provided X value or the center of the chart */
  zoomAround (factor: number, x?: number, event?: KeyboardEvent): void {
    const scale = this._getScale()
    if (!scale) return

    const [r0, r1] = scale.range()
    const px = isNumber(x) ? scale(x) : (r0 + r1) / 2
    this.setDomain(transformDomain(scale, factor, px, px), event, +scale.invert(px))
  }

  /** Resets the zoom, so the X domain comes from the container's `xDomain` or the data again */
  reset (event?: MouseEvent | KeyboardEvent): void {
    if (!this._domain) return

    this._domain = undefined
    this.config.onZoom?.(undefined, event)
    this._hooks?.render(true)
  }

  /** Drops the zoomed domain without calling `onZoom`. The XY Container calls it when its `xDomain` changes */
  clear (): void {
    this._domain = undefined
  }

  /** Handles the `+` and `-` keys of the focused chart: zooms around `x` (e.g. the data point
   * the Crosshair has been moved to with the keyboard) or the center. Called by the XY Container */
  onKeyDown (event: KeyboardEvent, x?: number): void {
    if (event.defaultPrevented || !['+', '=', '-'].includes(event.key)) return

    event.preventDefault()
    this.zoomAround(event.key === '-' ? 1 / ZOOM_KEYBOARD_FACTOR : ZOOM_KEYBOARD_FACTOR, x, event)
  }

  // Zoom doesn't render anything
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _render (): void {}

  /** A copy of the X scale with the visible domain */
  private _getScale (): ContinuousScale | undefined {
    const domain = this.getDomain()
    if (!this.xScale || !domain) return undefined
    const scale = this.xScale.copy() as ContinuousScale
    scale.domain(domain)
    return scale
  }

  private _getMinSpan (): number {
    const { config } = this
    if (isNumber(config.minSpan)) return config.minSpan

    if (this._autoMinSpan === null) {
      const values = this._components
        .filter(c => !c.config.excludeFromDomainCalculation && c.config.x && c.datamodel.data?.length)
        .flatMap(c => c.datamodel.data.map((d, i) => getNumber(d, c.config.x, i)))
      const step = getMinStep(values)
      this._autoMinSpan = step === undefined ? undefined : step * ZOOM_AUTO_MIN_SPAN_STEPS
    }

    return this._autoMinSpan ?? 0
  }

  private _isZoomed (): boolean {
    const [d0, d1] = this._domain ?? []
    const [e0, e1] = this._extent ?? []
    return !!this._domain && (d1 - d0) < (e1 - e0) * (1 - Number.EPSILON * 4)
  }

  /** Converts a horizontal client (viewport) coordinate to the components' coordinate space */
  private _getPlotX (clientX: number): number {
    return clientX - this.container.node().getBoundingClientRect().left - this._containerMargin.left
  }

  private _isFocused (): boolean {
    const element = this.container.node().parentElement
    const root = element?.getRootNode() as Document | ShadowRoot
    return !!element?.contains(root?.activeElement)
  }

  private _onWheel (event: WheelEvent): void {
    const scale = this._getScale()
    // Trackpad pinch gestures come as wheel events with `ctrlKey`
    const isPinch = event.ctrlKey || event.metaKey
    if (!scale || (!isPinch && !this._isFocused())) return

    event.preventDefault()
    const px = this._getPlotX(event.clientX)
    const deltaMode = event.deltaMode ?? 0
    const isPan = !isPinch && (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY))
    if (isPan) {
      // Not all browsers turn Shift + wheel into a horizontal scroll
      const delta = (event.deltaX || event.deltaY) * (ZOOM_WHEEL_PAN_MULTIPLIERS[deltaMode] ?? 1)
      this.setDomain(transformDomain(scale, 1, px, px - delta), event)
    } else {
      const exponent = -event.deltaY * (ZOOM_WHEEL_DELTA_MULTIPLIERS[deltaMode] ?? 1) * (event.ctrlKey ? ZOOM_PINCH_WHEEL_MULTIPLIER : 1)
      const k = 2 ** clamp(exponent, -ZOOM_WHEEL_MAX_EXPONENT, ZOOM_WHEEL_MAX_EXPONENT)
      this.setDomain(transformDomain(scale, k, px, px), event, +scale.invert(px))
    }
  }

  private _onPointerDown (event: PointerEvent): void {
    const scale = this._getScale()
    if (!scale) return

    if (event.pointerType === 'touch') {
      // One finger moves the Crosshair, two fingers pinch and pan
      this._touches.set(event.pointerId, [event.clientX, event.clientY])
      if (this._touches.size !== 2) return

      const [a, b] = [...this._touches.values()]
      this._pinch = { scale, fromPx: this._getPlotX((a[0] + b[0]) / 2), distance: Math.hypot(a[0] - b[0], a[1] - b[1]) }
      this._hooks?.onPinchStart(event)
    } else if (event.button === 0 && this._isZoomed()) {
      this._drag = { pointerId: event.pointerId, startPx: this._getPlotX(event.clientX), scale, isActive: false }
    }
  }

  private _onPointerMove (event: PointerEvent): void {
    if (this._touches.has(event.pointerId)) {
      this._touches.set(event.pointerId, [event.clientX, event.clientY])
      const pinch = this._pinch
      if (!pinch) return

      // Keep the Crosshair and the Tooltip from following the fingers while pinching
      event.stopPropagation()
      const [a, b] = [...this._touches.values()]
      const distance = Math.hypot(a[0] - b[0], a[1] - b[1])
      if (!distance || !pinch.distance) return

      const toPx = this._getPlotX((a[0] + b[0]) / 2)
      this.setDomain(transformDomain(pinch.scale, distance / pinch.distance, pinch.fromPx, toPx), event, +pinch.scale.invert(pinch.fromPx))
      return
    }

    const drag = this._drag
    if (drag?.pointerId !== event.pointerId) return
    // The button was released outside of the chart
    if (!(event.buttons & 1)) {
      this._drag = undefined
      return
    }

    const px = this._getPlotX(event.clientX)
    if (!drag.isActive) {
      if (Math.abs(px - drag.startPx) < ZOOM_DRAG_THRESHOLD_PX) return
      drag.isActive = true
      this.container.node().setPointerCapture?.(event.pointerId)
      this.container.style('cursor', 'grabbing')
    }

    this.setDomain(transformDomain(drag.scale, 1, drag.startPx, px), event)
  }

  private _onPointerUp (event: PointerEvent): void {
    if (this._touches.delete(event.pointerId) && this._touches.size < 2) this._pinch = undefined

    if (this._drag?.pointerId === event.pointerId) {
      if (this._drag.isActive) this.container.style('cursor', null)
      this._drag = undefined
    }
  }

  private _onDoubleClick (event: MouseEvent): void {
    if (!this._domain) return

    event.preventDefault()
    this.reset(event)
  }

  protected _onDestroy (): void {
    this.container?.on('.xy-zoom', null)
  }
}
