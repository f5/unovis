/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Brush, BrushConfigInterface, NumericAccessor, ContinuousScale, Arrangement } from '@volterra/vis'
import { D3BrushEvent } from 'd3-brush'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-brush',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisBrushComponent }],
})
export class VisBrushComponent<Datum> implements BrushConfigInterface<Datum>, AfterViewInit {
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

  /** Callback function to be called on any Brush event.
Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}` */
  @Input() onBrush: ((selection?: [number, number], event?: D3BrushEvent<Datum>, userDriven?: boolean) => any)

  /** Callback function to be called on the Brush start event.
Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}` */
  @Input() onBrushStart: ((selection?: [number, number], event?: D3BrushEvent<Datum>, userDriven?: boolean) => any)

  /** Callback function to be called on the Brush move event.
Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}` */
  @Input() onBrushMove: ((selection?: [number, number], event?: D3BrushEvent<Datum>, userDriven?: boolean) => any)

  /** Callback function to be called on the Brush end event.
Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}` */
  @Input() onBrushEnd: ((selection?: [number, number], event?: D3BrushEvent<Datum>, userDriven?: boolean) => any)

  /** Width of the Brush handle. Default: `1` */
  @Input() handleWidth: number

  /** Brush selection in data space, can be used to force set the selection from outside.
This config property gets updated on internal brush events. Default: `undefined` */
  @Input() selection: [number, number] | null

  /** Allow dragging the selected area as a whole in order to change the selected range. Default: `false` */
  @Input() draggable: boolean

  /** Position of the handle: 'Arrangement.Inside' or 'Arrangement.Outside'. Default: `Arrangement.Inside` */
  @Input() handlePosition: Arrangement | string

  /** Constraint Brush selection to a minimal length in data units. Default: `undefined` */
  @Input() selectionMinLength: number
  @Input() data: any

  component: Brush<Datum> | undefined

  ngAfterViewInit (): void {
    this.component = new Brush<Datum>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): BrushConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, onBrush, onBrushStart, onBrushMove, onBrushEnd, handleWidth, selection, draggable, handlePosition, selectionMinLength } = this
    const config = { duration, events, attributes, x, y, id, color, scales, adaptiveYScale, onBrush, onBrushStart, onBrushMove, onBrushEnd, handleWidth, selection, draggable, handlePosition, selectionMinLength }
    const keys = Object.keys(config) as (keyof BrushConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
