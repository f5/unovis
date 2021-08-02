/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { NumericAccessor, ContinuousScale, CurveType, StringAccessor, Area, AreaConfigInterface } from '@volterra/vis'

import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-area',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisAreaComponent }],
})
export class VisAreaComponent<Datum> implements AreaConfigInterface<Datum>, AfterViewInit {
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

  /** Curve type from the CurveType enum. Default: `CurveType.MonotoneX` */
  @Input() curveType: CurveType

  /** Baseline accessor function. Default: `undefined` */
  @Input() baseline: NumericAccessor<Datum>

  /** Opacity accessor function. Default: `1` */
  @Input() opacity: NumericAccessor<Datum>

  /** Optional area cursor. Default: `null` */
  @Input() cursor: StringAccessor<Datum>
  @Input() data: any

  component: Area<Datum> | undefined

  ngAfterViewInit (): void {
    this.component = new Area<Datum>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): AreaConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, curveType, baseline, opacity, cursor } = this
    const config = { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, curveType, baseline, opacity, cursor }
    const keys = Object.keys(config) as (keyof AreaConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
