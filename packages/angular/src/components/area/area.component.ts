// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Area,
  AreaConfigInterface,
  ContainerCore,
  VisEventType,
  VisEventCallback,
  NumericAccessor,
  ColorAccessor,
  ContinuousScale,
  CurveType,
  StringAccessor,
  GenericAccessor,
} from '@unovis/ts'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-area',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisAreaComponent }],
  standalone: false,
})
export class VisAreaComponent<Datum> implements AreaConfigInterface<Datum>, AfterViewInit {
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

  /** Accessor function for getting the values along the X axis. Default: `undefined` */
  @Input() x: NumericAccessor<Datum>

  /** A single of multiple accessor functions for getting the values along the Y axis. Default: `undefined` */
  @Input() y: NumericAccessor<Datum> | NumericAccessor<Datum>[]

  /** Accessor function for getting the unique data record id. Used for more persistent data updates. Default: `(d, i) => d.id ?? i` */
  @Input() id?: ((d: Datum, i: number, ...rest) => string)

  /** Area color accessor function. The whole data array will be passed as the first argument. Default: `undefined` */
  @Input() color?: ColorAccessor<Datum[]>

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

  /** Curve type from the CurveType enum. Default: `CurveType.MonotoneX` */
  @Input() curveType?: CurveType | string

  /** Baseline value or accessor function. Default: `undefined` */
  @Input() baseline?: NumericAccessor<Datum>

  /** Opacity value or accessor function. Default: `1` */
  @Input() opacity?: NumericAccessor<Datum[]>

  /** Optional area cursor. String or accessor function. Default: `null` */
  @Input() cursor?: StringAccessor<Datum[]>

  /** Display a line on the top of the area. Default: `false` */
  @Input() line?: boolean

  /** Line color accessor function. The whole data array will be passed as the first argument. Default: `undefined` */
  @Input() lineColor?: ColorAccessor<Datum[]>

  /** Line width in pixels. Default: `2` */
  @Input() lineWidth?: number

  /** Line dash array, see SVG's stroke-dasharray. Default: `undefined` */
  @Input() lineDashArray?: GenericAccessor<number[], Datum[]>

  /** If an area is smaller than 1px, extend it to have 1px height. Default: `false` */
  @Input() minHeight1Px?: boolean

  /** Minimum height of the area, use carefully.
   * This setting is useful when some of the area values are zeros or very small so visually they become
   * practically invisible, but you want to show that the data behind them exists and they're not just empty segments.
   * Default: `undefined` */
  @Input() minHeight?: number

  /** Whether to stack min height areas or not. Default: `undefined` */
  @Input() stackMinHeight?: boolean
  @Input() data: Datum[]

  component: Area<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Area<Datum>(this.getConfig())

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

  private getConfig (): AreaConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, xScale, yScale, excludeFromDomainCalculation, curveType, baseline, opacity, cursor, line, lineColor, lineWidth, lineDashArray, minHeight1Px, minHeight, stackMinHeight } = this
    const config = { duration, events, attributes, x, y, id, color, xScale, yScale, excludeFromDomainCalculation, curveType, baseline, opacity, cursor, line, lineColor, lineWidth, lineDashArray, minHeight1Px, minHeight, stackMinHeight }
    const keys = Object.keys(config) as (keyof AreaConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
