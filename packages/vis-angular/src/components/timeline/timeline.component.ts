/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Timeline, TimelineConfigInterface, NumericAccessor, ContinuousScale, StringAccessor } from '@volterra/vis'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-timeline',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisTimelineComponent }],
})
export class VisTimelineComponent<Datum> implements TimelineConfigInterface<Datum>, AfterViewInit {
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
