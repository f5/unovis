/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Line,
  LineConfigInterface,
  VisEventType,
  VisEventCallback,
  NumericAccessor,
  ColorAccessor,
  ContinuousScale,
  CurveType,
  GenericAccessor,
  StringAccessor,
} from '@volterra/vis'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-line',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisLineComponent }],
})
export class VisLineComponent<Datum> implements LineConfigInterface<Datum>, AfterViewInit {
  /** Animation duration of the data update transitions in milliseconds. Default: `600` */
  @Input() duration: number

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
  @Input() events: {
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
  @Input() attributes: {
    [selector: string]: {
      [attr: string]: string | number | boolean | ((datum: any) => string | number | boolean);
    };
  }

  /** Accessor function for getting the values along the X axis. Default: `undefined` */
  @Input() x: NumericAccessor<Datum>

  /** A single of multiple accessor functions for getting the values along the Y axis. Default: `undefined` */
  @Input() y: NumericAccessor<Datum> | NumericAccessor<Datum>[]

  /** Accessor function for getting the unique data record id. Used for more persistent data updates. Default: `(d, i) => d.id ?? i` */
  @Input() id: ((d: Datum, i?: number, ...rest) => string)

  /** Component color accessor function. Default: `d => d.color` */
  @Input() color: ColorAccessor<Datum | Datum[]>

  /** Scale for X dimension, e.g. Scale.scaleLinear(). If you set xScale you'll be responsible for setting it's `domain` and `range` as well.
   * Only continuous scales are supported.
   * Default: `undefined` */
  @Input() xScale: ContinuousScale

  /** Scale for Y dimension, e.g. Scale.scaleLinear(). If you set yScale you'll be responsible for setting it's `domain` and `range` as well.
   * Only continuous scales are supported.
   * Default: `undefined` */
  @Input() yScale: ContinuousScale

  /** Curve type from the CurveType enum */
  @Input() curveType: CurveType

  /** Line width in pixels */
  @Input() lineWidth: number

  /** Line dash array, see SVG's stroke-dasharray. Default: `undefined` */
  @Input() lineDashArray: GenericAccessor<number[], Datum>

  /** Value to be used in case of no data */
  @Input() noDataValue: number | null

  /** Highlight line on hover */
  @Input() highlightOnHover: boolean

  /** Optional link cursor. Default: `null` */
  @Input() cursor: StringAccessor<Datum[]>
  @Input() data: Datum[]

  component: Line<Datum> | undefined

  ngAfterViewInit (): void {
    this.component = new Line<Datum>(this.getConfig())
    if (this.data) this.component.setData(this.data)
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
    this.component?.render()
  }

  private getConfig (): LineConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, xScale, yScale, curveType, lineWidth, lineDashArray, noDataValue, highlightOnHover, cursor } = this
    const config = { duration, events, attributes, x, y, id, color, xScale, yScale, curveType, lineWidth, lineDashArray, noDataValue, highlightOnHover, cursor }
    const keys = Object.keys(config) as (keyof LineConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
