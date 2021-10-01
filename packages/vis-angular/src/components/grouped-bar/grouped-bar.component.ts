/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  GroupedBar,
  GroupedBarConfigInterface,
  VisEventType,
  VisEventCallback,
  NumericAccessor,
  ColorAccessor,
  ContinuousScale,
  StringAccessor,
} from '@volterra/vis'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-grouped-bar',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisGroupedBarComponent }],
})
export class VisGroupedBarComponent<Datum> implements GroupedBarConfigInterface<Datum>, AfterViewInit {
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

  /** Scale for X dimension, e.g. Scale.scaleLinear(). As of now, only continuous scales are supported. Default: `Scale.scaleLinear()` */
  @Input() xScale: ContinuousScale

  /** Scale for Y dimension, e.g. Scale.scaleLinear(). As of now, only continuous scales are supported. Default: `Scale.scaleLinear()` */
  @Input() yScale: ContinuousScale

  /** Sets the Y scale domain based on the X scale domain not the whole data. Useful when you manipulate chart's X domain from outside. Default: `false` */
  @Input() scaleByDomain: boolean

  /** Force set the group width in pixels. Default: `undefined` */
  @Input() groupWidth: number

  /** Maximum group width for dynamic sizing. Limits the groupWidth property from the top. Default: `undefined` */
  @Input() groupMaxWidth: number

  /** Expected step between the bar groups in the X axis units.
   * Needed to correctly calculate the width of the bar groups when there are gaps in the data.
   * Default: `undefined` */
  @Input() dataStep: number

  /** Fractional padding between the groups in the range of [0,1). Default: `0.05` */
  @Input() groupPadding: number

  /** Fractional padding between the bars in the range of [0,1). Default: `0` */
  @Input() barPadding: number

  /** Rounded bar corners. Boolean or number (to set the radius in pixels explicitly). Default: `2` */
  @Input() roundedCorners: number | boolean

  /** Sets the minimum bar height for better visibility of small values. Default: `1` */
  @Input() barMinHeight: number

  /** Configurable bar cursor when hovering over. Default: `null` */
  @Input() cursor: StringAccessor<Datum>
  @Input() data: Datum[]

  component: GroupedBar<Datum> | undefined

  ngAfterViewInit (): void {
    this.component = new GroupedBar<Datum>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): GroupedBarConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, xScale, yScale, scaleByDomain, groupWidth, groupMaxWidth, dataStep, groupPadding, barPadding, roundedCorners, barMinHeight, cursor } = this
    const config = { duration, events, attributes, x, y, id, color, xScale, yScale, scaleByDomain, groupWidth, groupMaxWidth, dataStep, groupPadding, barPadding, roundedCorners, barMinHeight, cursor }
    const keys = Object.keys(config) as (keyof GroupedBarConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
