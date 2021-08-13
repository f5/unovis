/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Timeline, TimelineConfigInterface, NumericAccessor, ColorAccessor, ContinuousScale, StringAccessor } from '@volterra/vis'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-timeline',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisTimelineComponent }],
})
export class VisTimelineComponent<Datum> implements TimelineConfigInterface<Datum>, AfterViewInit {
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

  /** Width of the lines */
  @Input() lineWidth: NumericAccessor<Datum>

  /** Timeline row height */
  @Input() rowHeight: number

  /** Line length accessor function or a value */
  @Input() length: NumericAccessor<Datum>

  /** Type accessor function, records of one type are plotted in one row */
  @Input() type: StringAccessor<Datum>

  /** Optional line cursor */
  @Input() cursor: StringAccessor<Datum>
  @Input() data: any

  component: Timeline<Datum> | undefined

  ngAfterViewInit (): void {
    this.component = new Timeline<Datum>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): TimelineConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, lineWidth, rowHeight, length, type, cursor } = this
    const config = { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, lineWidth, rowHeight, length, type, cursor }
    const keys = Object.keys(config) as (keyof TimelineConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
