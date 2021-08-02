/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { NumericAccessor, ContinuousScale, Position, AxisType, Spacing, FitMode, TrimMode, TextAlign, Axis, AxisConfigInterface } from '@volterra/vis'

import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-axis',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisAxisComponent }],
})
export class VisAxisComponent<Datum> implements AxisConfigInterface<Datum>, AfterViewInit {
  /** Animation duration */
  @Input() duration: number

  /**  */
  @Input() events: {
    [selector: string]: {
      [eventName: string]: (data: Datum) => void;
    };
  }

  /** Custom attributes */
  @Input() attributes: {
    [selector: string]: {
      [attr: string]: string | number | boolean | ((datum: any) => string | number | boolean);
    };
  }

  /** X accessor or number value */
  @Input() x: NumericAccessor<Datum>

  /** Y accessor or value */
  @Input() y: NumericAccessor<Datum> | NumericAccessor<Datum>[]

  /** Id accessor for better visual data updates */
  @Input() id: ((d: Datum, i?: number, ...rest) => string | number)

  /** Component color (string or color object) */
  @Input() color: string | any

  /** Coloring type */
  @Input() scales: {
    x?: ContinuousScale;
    y?: ContinuousScale;
  }

  /** Sets the Y scale domain based on the X scale domain not the whole data. Default: `false` */
  @Input() adaptiveYScale: boolean

  /** Axis position: top, bottom, right or left */
  @Input() position: Position | string

  /** Axis type: x or y */
  @Input() type: AxisType

  /** Inner axis padding. Adds space between chart and axis */
  @Input() padding: Spacing

  /** Extend domain line to be full size dimension */
  @Input() fullSize: boolean

  /** Axis label */
  @Input() label: string

  /** Font size of the axis label */
  @Input() labelFontSize: string

  /** Distance between axis and label in pixels */
  @Input() labelMargin: number

  /** Whether to draw the grid lines or not, default: true */
  @Input() gridLine: boolean

  /** Whether to draw the tick lines or not, default: true */
  @Input() tickLine: boolean

  /** Whether to draw the domain line or not, default: true */
  @Input() domainLine: boolean

  /** Draw minimum and maximum axis ticks only */
  @Input() minMaxTicksOnly: boolean

  /** Tick label formatter */
  @Input() tickFormat: (d: number | string, i: number, n: (number | string)[]) => string

  /** Explicitly set tick values */
  @Input() tickValues: number[]

  /** Approximate number of axis ticks (passed to d3 axis constructor) */
  @Input() numTicks: number

  /** Tick text fit mode: 'wrap' or 'trim' */
  @Input() tickTextFitMode: FitMode | string

  /** Maximum number of characters for tick text wrapping */
  @Input() tickTextLength: number

  /** Maximum width of tick text for wrapping */
  @Input() tickTextWidth: number

  /** Tick text wrapping separator */
  @Input() tickTextSeparator: string | string[]

  /** Tick text force word break if it doesn't fit */
  @Input() tickTextForceWordBreak: boolean

  /** Tick text trim mode: 'start , 'middle' or 'end' */
  @Input() tickTextTrimType: TrimMode | string

  /** Font size of tick text */
  @Input() tickTextFontSize: string

  /** Text alignment for ticks: `TextAlign.Left`, `TextAlign.Center` or `TextAlign.Right`. Default: `undefined` */
  @Input() tickTextAlign: TextAlign
  @Input() data: any

  component: Axis<Datum> | undefined

  ngAfterViewInit (): void {
    this.component = new Axis<Datum>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): AxisConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, position, type, padding, fullSize, label, labelFontSize, labelMargin, gridLine, tickLine, domainLine, minMaxTicksOnly, tickFormat, tickValues, numTicks, tickTextFitMode, tickTextLength, tickTextWidth, tickTextSeparator, tickTextForceWordBreak, tickTextTrimType, tickTextFontSize, tickTextAlign } = this
    const config = { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, position, type, padding, fullSize, label, labelFontSize, labelMargin, gridLine, tickLine, domainLine, minMaxTicksOnly, tickFormat, tickValues, numTicks, tickTextFitMode, tickTextLength, tickTextWidth, tickTextSeparator, tickTextForceWordBreak, tickTextTrimType, tickTextFontSize, tickTextAlign }
    const keys = Object.keys(config) as (keyof AxisConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
