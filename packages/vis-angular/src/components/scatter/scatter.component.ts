/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { NumericAccessor, ContinuousScale, SymbolType, StringAccessor, ColorAccessor, Scatter, ScatterConfigInterface } from '@volterra/vis'

import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-scatter',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisScatterComponent }],
})
export class VisScatterComponent<Datum> implements ScatterConfigInterface<Datum>, AfterViewInit {
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

  /** Single Y accessor function or constant value */
  @Input() y: NumericAccessor<Datum>

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

  /** Size accessor function or value in relative units. Default: `1` */
  @Input() size: NumericAccessor<Datum>

  /** Size Scale. Default: `Scale.scaleLinear()` */
  @Input() sizeScale: ContinuousScale

  /** Size Range, [number, number]. Default: `[5, 20]` */
  @Input() sizeRange: [number, number]

  /** Shape of scatter point: circle, cross, diamond, square, star, triangle and wye. Default: `SymbolType.Circle` */
  @Input() shape: ((d: Datum, i?: number, ...rest) => SymbolType) | SymbolType

  /** Label accessor function or string. Default: `undefined` */
  @Input() label: StringAccessor<Datum>

  /** Label color. Default: `undefined` */
  @Input() labelColor: ColorAccessor<Datum>

  /** Optional point cursor. Default: `null` */
  @Input() cursor: StringAccessor<Datum>

  /** Point color brightness ratio for switching between dark and light text label color. Default: `0.65` */
  @Input() labelTextBrightnessRatio: number
  @Input() data: any

  component: Scatter<Datum> | undefined

  ngAfterViewInit (): void {
    this.component = new Scatter<Datum>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): ScatterConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, size, sizeScale, sizeRange, shape, label, labelColor, cursor, labelTextBrightnessRatio } = this
    const config = { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, size, sizeScale, sizeRange, shape, label, labelColor, cursor, labelTextBrightnessRatio }
    const keys = Object.keys(config) as (keyof ScatterConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
