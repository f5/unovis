// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Scatter,
  ScatterConfigInterface,
  ContainerCore,
  VisEventType,
  VisEventCallback,
  NumericAccessor,
  ColorAccessor,
  ContinuousScale,
  SymbolType,
  StringAccessor,
  GenericAccessor,
  Position,
} from '@unovis/ts'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-scatter',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisScatterComponent }],
})
export class VisScatterComponent<Datum> implements ScatterConfigInterface<Datum>, AfterViewInit {
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

  /** Component color accessor function. Default: `d => d.color` */
  @Input() color?: ColorAccessor<Datum> | ColorAccessor<Datum[]>

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

  /** Size of the scatter plot marker (e.g. diameter if `SymbolType.Circle` is used for `shape`) in pixels.
   * Can be a constant value or an accessor function. But if `sizeRange` is set, then the values will be treated
   * as an input to `sizeScale`, and the resulting size will be different.
   * Default: `10` */
  @Input() size?: NumericAccessor<Datum>

  /** Size scale to be used if the `sizeRange` was set. Default: `Scale.scaleSqrt()` */
  @Input() sizeScale?: ContinuousScale

  /** Size range in the format of `[number, number]` to rescale the input values. Default: `undefined` */
  @Input() sizeRange?: [number, number]

  /** Shape of the scatter point. Accessor function or constant value: `SymbolType.Circle`, `SymbolType.Cross`, `SymbolType.Diamond`, `SymbolType.Square`,
   * `SymbolType.Star`, `SymbolType.Triangle` or `SymbolType.Wye`.
   * Default: `SymbolType.Circle` */
  @Input() shape?: ((d: Datum, i?: number, ...rest) => (SymbolType | string)) | SymbolType | string

  /** Label accessor function or string. Default: `undefined` */
  @Input() label?: StringAccessor<Datum>

  /** Label color. Default: `undefined` */
  @Input() labelColor?: ColorAccessor<Datum>

  /** Optional point cursor. Default: `null` */
  @Input() cursor?: StringAccessor<Datum>

  /** Point color brightness ratio for switching between dark and light text label color. Default: `0.65` */
  @Input() labelTextBrightnessRatio?: number

  /** Label position. Default: `Position.Bottom` */
  @Input() labelPosition?: GenericAccessor<Position | string, Datum>
  @Input() data: Datum[]

  component: Scatter<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Scatter<Datum>(this.getConfig())

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

  private getConfig (): ScatterConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, xScale, yScale, excludeFromDomainCalculation, size, sizeScale, sizeRange, shape, label, labelColor, cursor, labelTextBrightnessRatio, labelPosition } = this
    const config = { duration, events, attributes, x, y, id, color, xScale, yScale, excludeFromDomainCalculation, size, sizeScale, sizeRange, shape, label, labelColor, cursor, labelTextBrightnessRatio, labelPosition }
    const keys = Object.keys(config) as (keyof ScatterConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
