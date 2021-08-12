/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { StackedBar, StackedBarConfigInterface, NumericAccessor, ColorAccessor, ContinuousScale, StringAccessor } from '@volterra/vis'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-stacked-bar',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisStackedBarComponent }],
})
export class VisStackedBarComponent<Datum> implements StackedBarConfigInterface<Datum>, AfterViewInit {
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
      [eventName: string]: (data: any, event?: Event, i?: number, els?: SVGElement[] | HTMLElement[]) => void;
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
  @Input() id: ((d: Datum, i?: number, ...rest) => string | number)

  /** Component color accessor function. Default: `d => d.color` */
  @Input() color: ColorAccessor<Datum>

  /** X and Y scales. As of now, only continuous scales are supported. Default: `{ x: Scale.scaleLinear(), y: Scale.scaleLinear() } */
  @Input() scales: {
    x?: ContinuousScale;
    y?: ContinuousScale;
  }

  /** Sets the Y scale domain based on the X scale domain not the whole data. Useful when you manipulate chart's X domain from outside. Default: `false` */
  @Input() adaptiveYScale: boolean

  /** Bar width in pixels */
  @Input() barWidth: number

  /** Maximum bar width for dynamic sizing. Limits the barWidth property on the top */
  @Input() barMaxWidth: number

  /** Expected step between the bars in the X axis units. Used to dynamically calculate the width for bars correctly when data has gaps */
  @Input() dataStep: number

  /** Fractional padding between the bars in the range of [0,1). Default: `0` */
  @Input() barPadding: number

  /** Orientation of the chart */
  @Input() isVertical: boolean

  /** Rounded corners for top bars. Boolean or number (to set the radius in pixels). Default: `true` */
  @Input() roundedCorners: number | boolean

  /** Optional bar cursor. Default: `null` */
  @Input() cursor: StringAccessor<Datum>

  /** Sets the minimum bar height to 1 for better visibility of small values. Default: `false` */
  @Input() barMinHeight: boolean

  /** Base value to test data existence when barMinHeight is set to `true`. Anything equal to barMinHeightZeroValue
   *  will not be rendered on the chart. Default: `null` */
  @Input() barMinHeightZeroValue: any
  @Input() data: any

  component: StackedBar<Datum> | undefined

  ngAfterViewInit (): void {
    this.component = new StackedBar<Datum>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): StackedBarConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, barWidth, barMaxWidth, dataStep, barPadding, isVertical, roundedCorners, cursor, barMinHeight, barMinHeightZeroValue } = this
    const config = { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, barWidth, barMaxWidth, dataStep, barPadding, isVertical, roundedCorners, cursor, barMinHeight, barMinHeightZeroValue }
    const keys = Object.keys(config) as (keyof StackedBarConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
