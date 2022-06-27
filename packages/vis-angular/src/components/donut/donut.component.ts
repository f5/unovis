// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Donut, DonutConfigInterface, ContainerCore, VisEventType, VisEventCallback, NumericAccessor, ColorAccessor } from '@volterra/vis'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-donut',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisCoreComponent, useExisting: VisDonutComponent }],
})
export class VisDonutComponent<Datum> implements DonutConfigInterface<Datum>, AfterViewInit {
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

  /** Accessor function for getting the unique data record id. Used for more persistent data updates. Default: `(d, i) => d.id ?? i` */
  @Input() id?: ((d: Datum, i?: number, ...rest) => string | number)

  /** Value accessor function. Default: `undefined` */
  @Input() value: NumericAccessor<Datum>

  /** Diagram angle range. Default: `[0, 2 * Math.PI]` */
  @Input() angleRange?: [number, number]

  /** Pad angle. Default: `0` */
  @Input() padAngle?: number

  /** Custom sort function. Default: `undefined` */
  @Input() sortFunction?: (a: Datum, b: Datum) => number

  /** Corner Radius. Default: `0` */
  @Input() cornerRadius?: number

  /** Color accessor function. Default: `undefined` */
  @Input() color?: ColorAccessor<Datum>

  /** Explicitly set the donut outer radius. Default: `undefined` */
  @Input() radius?: number

  /** Arc width in pixels. Set to `0` if you want to have a pie chart. Default: `20` */
  @Input() arcWidth?: number

  /** Central label accessor function or text. Default: `undefined` */
  @Input() centralLabel?: string

  /** Central sub-label accessor function or text. Default: `undefined` */
  @Input() centralSubLabel?: string

  /** Enables wrapping for the sub-label. Default: `true` */
  @Input() centralSubLabelWrap?: boolean

  /** Draw segment as a thin line when its value is 0. Default: `false` */
  @Input() preventEmptySegments?: boolean
  @Input() data: Datum[]

  component: Donut<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Donut<Datum>(this.getConfig())

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

  private getConfig (): DonutConfigInterface<Datum> {
    const { duration, events, attributes, id, value, angleRange, padAngle, sortFunction, cornerRadius, color, radius, arcWidth, centralLabel, centralSubLabel, centralSubLabelWrap, preventEmptySegments } = this
    const config = { duration, events, attributes, id, value, angleRange, padAngle, sortFunction, cornerRadius, color, radius, arcWidth, centralLabel, centralSubLabel, centralSubLabelWrap, preventEmptySegments }
    const keys = Object.keys(config) as (keyof DonutConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
