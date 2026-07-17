// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { RadialBar, RadialBarConfigInterface, ContainerCore, VisEventType, VisEventCallback, NumericAccessor, ColorAccessor } from '@unovis/ts'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-radial-bar',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisCoreComponent, useExisting: VisRadialBarComponent }],
  standalone: false,
})
export class VisRadialBarComponent<Datum> implements RadialBarConfigInterface<Datum>, AfterViewInit {
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
  @Input() id?: ((d: Datum, i: number, ...rest) => string | number)

  /** Value accessor function. Default: `undefined` */
  @Input() value: NumericAccessor<Datum>

  /** Maximum value accessor or an array of maximums (indexed by each datum's original position in `data` before sorting).
   * Used to scale each bar's arc length: each bar fills `(value / maxValue) * (angleRange[1] - angleRange[0])`.
   * When `undefined`, the maximum is derived from the data. Default: `undefined` */
  @Input() maxValue?: NumericAccessor<Datum> | number[]

  /** Diagram angle range. Default: `[0, 2 * Math.PI]` */
  @Input() angleRange?: [number, number]

  /** Pad angle in radians applied between the bar and its end. Default: `0` */
  @Input() padAngle?: number

  /** Custom sort function. Default: `undefined` */
  @Input() sortFunction?: (a: Datum, b: Datum) => number

  /** Corner Radius. Default: `0` */
  @Input() cornerRadius?: number

  /** Color accessor function. Default: `undefined` */
  @Input() color?: ColorAccessor<Datum>

  /** Explicitly set the outer radius of the outermost ring. Default: `undefined` */
  @Input() radius?: number

  /** Width of each ring (track) in pixels. Default: `16` */
  @Input() trackWidth?: number

  /** Gap between rings in pixels. Default: `4` */
  @Input() trackPadding?: number

  /** When `true`, `data[0]` is the innermost ring instead of the outermost. Default: `false` */
  @Input() reverseOrder?: boolean

  /** Central label text. Default: `undefined` */
  @Input() centralLabel?: string

  /** Central sub-label text. Default: `undefined` */
  @Input() centralSubLabel?: string

  /** Enables wrapping for the sub-label. Default: `true` */
  @Input() centralSubLabelWrap?: boolean

  /** Central label and sub-label horizontal offset in pixels. Default: `undefined` */
  @Input() centralLabelOffsetX?: number

  /** Central label and sub-label vertical offset in pixels. Default: `undefined` */
  @Input() centralLabelOffsetY?: number

  /** Show a faded background track for each ring. The color is configurable via
   * the `--vis-radial-bar-background-color` and `--vis-dark-radial-bar-background-color` CSS variables.
   * Default: `true` */
  @Input() showBackground?: boolean

  /** Background angle range. When `undefined`, the value will be taken from `angleRange`. Default: `undefined` */
  @Input() backgroundAngleRange?: [number, number]
  @Input() data: Datum[]

  component: RadialBar<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new RadialBar<Datum>(this.getConfig())

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

  private getConfig (): RadialBarConfigInterface<Datum> {
    const { duration, events, attributes, id, value, maxValue, angleRange, padAngle, sortFunction, cornerRadius, color, radius, trackWidth, trackPadding, reverseOrder, centralLabel, centralSubLabel, centralSubLabelWrap, centralLabelOffsetX, centralLabelOffsetY, showBackground, backgroundAngleRange } = this
    const config = { duration, events, attributes, id, value, maxValue, angleRange, padAngle, sortFunction, cornerRadius, color, radius, trackWidth, trackPadding, reverseOrder, centralLabel, centralSubLabel, centralSubLabelWrap, centralLabelOffsetX, centralLabelOffsetY, showBackground, backgroundAngleRange }
    const keys = Object.keys(config) as (keyof RadialBarConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
