/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { NumericAccessor, ContinuousScale, FreeBrushMode, FreeBrushSelection, FreeBrush, FreeBrushConfigInterface } from '@volterra/vis'
import { D3BrushEvent } from 'd3-brush'

import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-free-brush',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisFreeBrushComponent }],
})
export class VisFreeBrushComponent<Datum> implements FreeBrushConfigInterface<Datum>, AfterViewInit {
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

  /** Brush selection mode. X - horizontal, Y - vertical, XY - both. Default: `FreeBrushMode.X` */
  @Input() mode: FreeBrushMode

  /** Callback function to be called on any Brush event.
Default: `(selection: FreeBrushSelection, event: D3BrushEvent<Datum>, userDriven: boolean): void => {}` */
  @Input() onBrush: ((selection?: FreeBrushSelection, event?: D3BrushEvent<Datum>, userDriven?: boolean) => any)

  /** Callback function to be called on the Brush start event.
Default: `(selection: FreeBrushSelection, event: D3BrushEvent<Datum>, userDriven: boolean): void => {}` */
  @Input() onBrushStart: ((selection?: FreeBrushSelection, event?: D3BrushEvent<Datum>, userDriven?: boolean) => any)

  /** Callback function to be called on the Brush move event.
Default: `(selection: FreeBrushSelection, event: D3BrushEvent<Datum>, userDriven: boolean): void => {}` */
  @Input() onBrushMove: ((selection?: FreeBrushSelection, event?: D3BrushEvent<Datum>, userDriven?: boolean) => any)

  /** Callback function to be called on the Brush end event.
Default: `(selection: FreeBrushSelection, event: D3BrushEvent<Datum>, userDriven: boolean)L void => {}` */
  @Input() onBrushEnd: ((selection?: FreeBrushSelection, event?: D3BrushEvent<Datum>, userDriven?: boolean) => any)

  /** Width of the Brush handle. Default: `1` */
  @Input() handleWidth: number

  /** Brush selection in data space, can be used to force set the selection from outside.
In case of two dimensional mode, the selection has the following format: `[[xMin, xMax], [yMin, yMax]]`.
This config property gets updated on internal brush events. Default: `undefined` */
  @Input() selection: FreeBrushSelection | null

  /** Constraint Brush selection to a minimal length in data units. Default: `undefined` */
  @Input() selectionMinLength: number | [number, number]

  /** Automatically hide the brush after selection. Default: `true` */
  @Input() autoHide: boolean
  @Input() data: any

  component: FreeBrush<Datum> | undefined

  ngAfterViewInit (): void {
    this.component = new FreeBrush<Datum>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): FreeBrushConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, mode, onBrush, onBrushStart, onBrushMove, onBrushEnd, handleWidth, selection, selectionMinLength, autoHide } = this
    const config = { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, mode, onBrush, onBrushStart, onBrushMove, onBrushEnd, handleWidth, selection, selectionMinLength, autoHide }
    const keys = Object.keys(config) as (keyof FreeBrushConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
