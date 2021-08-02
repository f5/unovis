/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { NumericAccessor, ContinuousScale, Tooltip, XYComponentCore, Crosshair, CrosshairConfigInterface } from '@volterra/vis'

import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-crosshair',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisCrosshairComponent }],
})
export class VisCrosshairComponent<Datum> implements CrosshairConfigInterface<Datum>, AfterViewInit {
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

  /** Separate array of accessors for stacked components (eg StackedBar, Area). Default: `[]` */
  @Input() yStacked: NumericAccessor<Datum>[]

  /** Baseline accessor function for stacked values, useful with stacked areas. Default: `null` */
  @Input() baseline: NumericAccessor<Datum>

  /** An instance of the Tooltip component to be used with Crosshair. Default: `undefined` */
  @Input() tooltip: Tooltip<XYComponentCore<Datum>, Datum> | undefined

  /** Tooltip template accessor. The function is supposed to return either a valid HTML string or an HTMLElement. Default: `d => ''` */
  @Input() template: (data: Datum, i: number, elements: any) => string | HTMLElement

  /** Hide Crosshair when the corresponding element is far from mouse pointer. Default: `true` */
  @Input() hideWhenFarFromPointer: boolean

  /** Distance to check in the hideWhenFarFromPointer condition. Default: `100` */
  @Input() hideWhenFarFromPointerDistance: number
  @Input() data: any

  component: Crosshair<Datum> | undefined

  ngAfterViewInit (): void {
    this.component = new Crosshair<Datum>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): CrosshairConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, yStacked, baseline, tooltip, template, hideWhenFarFromPointer, hideWhenFarFromPointerDistance } = this
    const config = { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, yStacked, baseline, tooltip, template, hideWhenFarFromPointer, hideWhenFarFromPointerDistance }
    const keys = Object.keys(config) as (keyof CrosshairConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
