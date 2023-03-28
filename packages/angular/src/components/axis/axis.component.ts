// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Axis,
  AxisConfigInterface,
  ContainerCore,
  VisEventType,
  VisEventCallback,
  NumericAccessor,
  ColorAccessor,
  ContinuousScale,
  Position,
  AxisType,
  FitMode,
  TrimMode,
  TextAlign,
} from '@unovis/ts'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-axis',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisAxisComponent }],
})
export class VisAxisComponent<Datum> implements AxisConfigInterface<Datum>, AfterViewInit {
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

  /** Axis position: `Position.Top`, `Position.Bottom`, `Position.Right` or `Position.Left`. Default: `undefined` */
  @Input() position?: Position | string

  /** Axis type: `AxisType.X` or `AxisType.Y` */
  @Input() type?: AxisType | string

  /** Extend the axis domain line to be full width or full height. Default: `true` */
  @Input() fullSize?: boolean

  /** Axis label. Default: `undefined` */
  @Input() label?: string

  /** Font size of the axis label as CSS string. Default: `null` */
  @Input() labelFontSize?: string | null

  /** Distance between the axis and the label in pixels. Default: `8` */
  @Input() labelMargin?: number

  /** Sets whether to draw the grid lines or not. Default: `true` */
  @Input() gridLine?: boolean

  /** Sets whether to draw the tick lines or not. Default: `true` */
  @Input() tickLine?: boolean

  /** Sets whether to draw the domain line or not. Default: `true` */
  @Input() domainLine?: boolean

  /** Draw the min and max axis ticks only. Default: `false` */
  @Input() minMaxTicksOnly?: boolean

  /** Tick label formatter function. Default: `undefined` */
  @Input() tickFormat?: ((tick: number, i: number, ticks: number[]) => string) | ((tick: Date, i: number, ticks: Date[]) => string)

  /** Explicitly set tick values. Default: `undefined` */
  @Input() tickValues?: number[]

  /** Set the approximate number of axis ticks (will be passed to D3's axis constructor). Default: `undefined` */
  @Input() numTicks?: number

  /** Tick text fit mode: `FitMode.Wrap` or `FitMode.Trim`. Default: `FitMode.Wrap`. */
  @Input() tickTextFitMode?: FitMode | string

  /** Maximum number of characters for tick text wrapping. Default: `undefined` */
  @Input() tickTextLength?: number

  /** Maximum width in pixels for the tick text to be wrapped or trimmed. Default: `undefined` */
  @Input() tickTextWidth?: number

  /** Tick text wrapping separator. String or array of strings. Default: `' '` */
  @Input() tickTextSeparator?: string | string[]

  /** Force word break for ticks when they don't fit. Default: `false` */
  @Input() tickTextForceWordBreak?: boolean

  /** Tick text trim mode: `TrimMode.Start`, `TrimMode.Middle` or `TrimMode.End`. Default: `TrimMode.Middle` */
  @Input() tickTextTrimType?: TrimMode | string

  /** Font size of the tick text as CSS string. Default: `null` */
  @Input() tickTextFontSize?: string | null

  /** Text alignment for ticks: `TextAlign.Left`, `TextAlign.Center` or `TextAlign.Right`. Default: `undefined` */
  @Input() tickTextAlign?: TextAlign | string

  /** The spacing in pixels between the tick and it's label. Default: `8` */
  @Input() tickPadding?: number
  @Input() data: Datum[]

  component: Axis<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Axis<Datum>(this.getConfig())

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

  private getConfig (): AxisConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, xScale, yScale, excludeFromDomainCalculation, position, type, fullSize, label, labelFontSize, labelMargin, gridLine, tickLine, domainLine, minMaxTicksOnly, tickFormat, tickValues, numTicks, tickTextFitMode, tickTextLength, tickTextWidth, tickTextSeparator, tickTextForceWordBreak, tickTextTrimType, tickTextFontSize, tickTextAlign, tickPadding } = this
    const config = { duration, events, attributes, x, y, id, color, xScale, yScale, excludeFromDomainCalculation, position, type, fullSize, label, labelFontSize, labelMargin, gridLine, tickLine, domainLine, minMaxTicksOnly, tickFormat, tickValues, numTicks, tickTextFitMode, tickTextLength, tickTextWidth, tickTextSeparator, tickTextForceWordBreak, tickTextTrimType, tickTextFontSize, tickTextAlign, tickPadding }
    const keys = Object.keys(config) as (keyof AxisConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
