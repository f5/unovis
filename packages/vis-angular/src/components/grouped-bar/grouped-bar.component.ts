/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { NumericAccessor, ContinuousScale, StringAccessor, GroupedBar, GroupedBarConfigInterface } from '@volterra/vis'

import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-grouped-bar',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisGroupedBarComponent }],
})
export class VisGroupedBarComponent<Datum> implements GroupedBarConfigInterface<Datum>, AfterViewInit {
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

  /** Optionaly set the group width in pixels (distributed evenly among the group bars) */
  @Input() groupWidth: number

  /** Maximum bar width for dynamic sizing. Limits the barWidth property from the top */
  @Input() groupMaxWidth: number

  /** Expected step between the bars in the X axis units. Used to dynamically calculate the width for bars correctly when data has gaps */
  @Input() dataStep: number

  /** Fractional padding between the groups in the range of [0,1). Default 0.05 */
  @Input() groupPadding: number

  /** Fractional padding between the bars in the range of [0,1). Default: 0 */
  @Input() barPadding: number

  /** Orientation of the chart. Default: true */
  @Input() isVertical: boolean

  /** Rounded corners for bars. Boolean or number (to set the radius in pixels). Default: true */
  @Input() roundedCorners: number | boolean

  /** Sets the minimum bar height for better visibility of small values. Default: 1 */
  @Input() barMinHeight: number

  /** Optional bar cursor. Default: `null` */
  @Input() cursor: StringAccessor<Datum>
  @Input() data: any

  component: GroupedBar<Datum> | undefined

  ngAfterViewInit (): void {
    this.component = new GroupedBar<Datum>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): GroupedBarConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, groupWidth, groupMaxWidth, dataStep, groupPadding, barPadding, isVertical, roundedCorners, barMinHeight, cursor } = this
    const config = { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, groupWidth, groupMaxWidth, dataStep, groupPadding, barPadding, isVertical, roundedCorners, barMinHeight, cursor }
    const keys = Object.keys(config) as (keyof GroupedBarConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
