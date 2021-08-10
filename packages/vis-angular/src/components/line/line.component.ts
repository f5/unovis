/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Line, LineConfigInterface, NumericAccessor, ContinuousScale, CurveType, GenericAccessor, StringAccessor } from '@volterra/vis'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-line',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisLineComponent }],
})
export class VisLineComponent<Datum> implements LineConfigInterface<Datum>, AfterViewInit {
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

  /** Curve type from the CurveType enum */
  @Input() curveType: CurveType

  /** Line width in pixels */
  @Input() lineWidth: number

  /** Line dash array, see SVG's stroke-dasharray. Default: `undefined` */
  @Input() lineDashArray: GenericAccessor<number[], Datum>

  /** Value to be used in case of no data */
  @Input() noDataValue: number | null

  /** Highlight line on hover */
  @Input() highlightOnHover: boolean

  /** Optional link cursor. Default: `null` */
  @Input() cursor: StringAccessor<Datum>
  @Input() data: any

  component: Line<Datum> | undefined

  ngAfterViewInit (): void {
    this.component = new Line<Datum>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): LineConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, curveType, lineWidth, lineDashArray, noDataValue, highlightOnHover, cursor } = this
    const config = { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, curveType, lineWidth, lineDashArray, noDataValue, highlightOnHover, cursor }
    const keys = Object.keys(config) as (keyof LineConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
