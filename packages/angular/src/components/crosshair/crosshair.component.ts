// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Crosshair,
  CrosshairConfigInterface,
  ContainerCore,
  VisEventType,
  VisEventCallback,
  NumericAccessor,
  ColorAccessor,
  ContinuousScale,
  Tooltip,
  CrosshairSnapMode,
  CrosshairCircle,
} from '@unovis/ts'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-crosshair',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisCrosshairComponent }],
  standalone: false,
})
export class VisCrosshairComponent<Datum> implements CrosshairConfigInterface<Datum>, AfterViewInit {
  /** Animation duration of the data update transitions in milliseconds. Default: `600` */
  @Input() duration?: number

  /** Events configuration. An object containing properties in the following format:
   *
   * ```
   * {
   * \[selectorString]: {
   *     \[eventType]: callbackFunction
   *  }
   * }
   * ```
   * e.g.:
   * ```
   * {
   * \[Area.selectors.area]: {
   *    click: (d) => console.log("Clicked Area", d)
   *  }
   * }
   * ``` */
  @Input() events?: {
    [selector: string]: {
      [eventType in VisEventType]?: VisEventCallback
    };
  }

  /** You can set every SVG and HTML visualization object to have a custom DOM attributes, which is useful
   * when you want to do unit or end-to-end testing. Attributes configuration object has the following structure:
   *
   * ```
   * {
   * \[selectorString]: {
   *     \[attributeName]: attribute constant value or accessor function
   *  }
   * }
   * ```
   * e.g.:
   * ```
   * {
   * \[Area.selectors.area]: {
   *    "test-value": d => d.value
   *  }
   * }
   * ``` */
  @Input() attributes?: {
    [selector: string]: {
      [attr: string]: string | number | boolean | ((datum: any) => string | number | boolean);
    };
  }

  /** Optional accessor function for getting the values along the X axis. Default: `undefined` */
  @Input() x?: NumericAccessor<Datum>

  /** Optional single of multiple accessor functions for getting the values along the Y axis. Default: `undefined` */
  @Input() y?: NumericAccessor<Datum> | NumericAccessor<Datum>[]

  /** Accessor function for getting the unique data record id. Used for more persistent data updates. Default: `(d, i) => d.id ?? i` */
  @Input() id?: ((d: Datum, i: number, ...rest) => string)

  /** Optional color array or color accessor function for crosshair circles. Default: `d => d.color` */
  @Input() color?: ColorAccessor<Datum>

  /** Array of data color keys. Use to map data keys to colors.
   * Expected to the same length as the `y` accessors array.
   * Default: `undefined` */
  @Input() colorKeys?: string[]

  /** Scale for X dimension, e.g. Scale.scaleLinear(). If you set xScale you'll be responsible for setting it's `domain` and `range` as well.
   * Only continuous scales are supported.
   * Default: `undefined` */
  @Input() xScale?: ContinuousScale

  /** Scale for Y dimension, e.g. Scale.scaleLinear(). If you set yScale you'll be responsible for setting it's `domain` and `range` as well.
   * Only continuous scales are supported.
   * Default: `undefined` */
  @Input() yScale?: ContinuousScale

  /** Identifies whether the component should be excluded from overall X and Y domain calculations or not.
   * This property can be useful when you want pass individual data to a component and you don't want it to affect
   * the scales of the chart.
   * Default: `false` */
  @Input() excludeFromDomainCalculation?: boolean

  /** Optional stroke color accessor function for crosshair circles. Default: `undefined` */
  @Input() strokeColor?: ColorAccessor<Datum>

  /** Optional stroke width for crosshair circles. Default: `undefined` */
  @Input() strokeWidth?: NumericAccessor<Datum>

  /** Radius of crosshair circles in pixels. Default: `3` */
  @Input() circleRadius?: number

  /** When `true`, the Crosshair also renders a horizontal line. The line is placed at the Y position of the
   * crosshair circle closest to the mouse pointer (i.e. the snapped data point), or follows the pointer
   * when there are no circles to snap to (e.g. when `snapToData` is `false`). Default: `false` */
  @Input() showHorizontalLine?: boolean

  /** Separate array of accessors for stacked components (eg StackedBar, Area). Default: `undefined` */
  @Input() yStacked?: NumericAccessor<Datum>[]

  /** Baseline accessor function for stacked values, useful with stacked areas. Default: `null` */
  @Input() baseline?: NumericAccessor<Datum>

  /** An instance of the Tooltip component to be used with Crosshair. Default: `undefined` */
  @Input() tooltip?: Tooltip | undefined

  /** Tooltip template accessor. The function is supposed to return either a valid HTML string or an HTMLElement.
   * When `snapToData` is `false`, `datum` will be `undefined` but `data` and `leftNearestDatumIndex` will be provided.
   * Default: `d => ''` */
  @Input() template?: (datum: Datum, x: number | Date, data: Datum[], leftNearestDatumIndex?: number) => string | HTMLElement

  /** Hide Crosshair when the corresponding datum element is far from mouse pointer. Default: `true` */
  @Input() hideWhenFarFromPointer?: boolean

  /** Distance in pixels to check in the hideWhenFarFromPointer condition. Default: `100` */
  @Input() hideWhenFarFromPointerDistance?: number

  /** Snap to the nearest data point.
   * If disabled, the tooltip template will receive only the horizontal position of the crosshair and you'll be responsible
   * for getting the underlying data records and crosshair circles (see the `getCircles` configuration option).
   * Default: `true` */
  @Input() snapToData?: boolean

  /** When `snapToData` is enabled, controls how the nearest datum is found:
   * - `CrosshairSnapMode.XY`: snap to the datum closest to the mouse pointer in both X and Y (measured in pixel space).
   *  This is the right choice for Scatter charts where many points can share similar X values.
   * - `CrosshairSnapMode.X`: snap to the datum closest along the X axis only. Best for time series / line / area
   *  charts where the crosshair is a vertical line tracking the X position.
   *
   * Has no effect when `forceShowAt` is set (no pointer Y is available — it falls back to `CrosshairSnapMode.X`).
   * Default: `CrosshairSnapMode.X` */
  @Input() snapMode?: CrosshairSnapMode | `${CrosshairSnapMode}`

  /** Custom function for setting up the crosshair circles, usually needed when `snapToData` is set to `false`.
   * The function receives the horizontal position of the crosshair (in the data space, not in pixels), the data array,
   * the `yScale` instance to help you calculate the correct vertical position of the circles, and the nearest datum index.
   * It has to return an array of the `CrosshairCircle` objects: `{ y: number; color: string; opacity?: number }[]`.
   * Default: `undefined` */
  @Input() getCircles?: (x: number | Date, data: Datum[], yScale: ContinuousScale, leftNearestDatumIndex?: number) => CrosshairCircle[]

  /** Callback function that is called when the crosshair is moved:
   * - `x` is the horizontal position of the crosshair in the data space;
   * - `datum` is the nearest datum to the crosshair;
   * - `datumIndex` is the index of the nearest datum.
   * - `event` is the event that triggered the crosshair move (mouse or wheel).
   *
   * When the mouse goes out of the container and on wheel events, all the arguments are `undefined` except for `event`.
   * Default: `undefined` */
  @Input() onCrosshairMove?: (x?: number | Date, datum?: Datum, datumIndex?: number, event?: MouseEvent | WheelEvent) => void

  /** Force the crosshair to show at a specific position. Default: `undefined` */
  @Input() forceShowAt?: number | Date

  /** Skip range checks for crosshair visibility. When true, crosshair will show regardless of position within chart bounds. Default: `false`
   * This is useful for testing, especially when you only triggers mousemove event but does not have real mouse event. */
  @Input() skipRangeCheck?: boolean

  /** Minimum fraction (`0` to `1`) of the container's area that must be visible in the
   * viewport for the Crosshair (and its Tooltip) to be displayed. This prevents the
   * Crosshair from showing when the chart is mostly scrolled out of view. Charts that are
   * wider or taller than the viewport may never reach the default ratio, so lower this
   * value (or set it to `0` to always show the Crosshair) for large charts. Default: `0.35` */
  @Input() visibilityThreshold?: number
  @Input() data: Datum[]

  component: Crosshair<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Crosshair<Datum>(this.getConfig())

    if (this.data) {
      this.component.setData(this.data)
      this.componentContainer?.render()
    }
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
    this.componentContainer?.render()
  }

  private getConfig (): CrosshairConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, colorKeys, xScale, yScale, excludeFromDomainCalculation, strokeColor, strokeWidth, circleRadius, showHorizontalLine, yStacked, baseline, tooltip, template, hideWhenFarFromPointer, hideWhenFarFromPointerDistance, snapToData, snapMode, getCircles, onCrosshairMove, forceShowAt, skipRangeCheck, visibilityThreshold } = this
    const config = { duration, events, attributes, x, y, id, color, colorKeys, xScale, yScale, excludeFromDomainCalculation, strokeColor, strokeWidth, circleRadius, showHorizontalLine, yStacked, baseline, tooltip, template, hideWhenFarFromPointer, hideWhenFarFromPointerDistance, snapToData, snapMode, getCircles, onCrosshairMove, forceShowAt, skipRangeCheck, visibilityThreshold }
    const keys = Object.keys(config) as (keyof CrosshairConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
