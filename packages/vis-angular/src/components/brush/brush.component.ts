/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Brush,
  BrushConfigInterface,
  ContainerCore,
  VisEventType,
  VisEventCallback,
  NumericAccessor,
  ColorAccessor,
  ContinuousScale,
  Arrangement,
} from '@volterra/vis'
import { D3BrushEvent } from 'd3-brush'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-brush',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisBrushComponent }],
})
export class VisBrushComponent<Datum> implements BrushConfigInterface<Datum>, AfterViewInit {
  /** Animation duration of the data update transitions in milliseconds. Default: `600` */
  @Input() duration: number

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
  @Input() events: {
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
  @Input() attributes: {
    [selector: string]: {
      [attr: string]: string | number | boolean | ((datum: any) => string | number | boolean);
    };
  }

  /** Accessor function for getting the values along the X axis. Default: `undefined` */
  @Input() x: NumericAccessor<Datum>

  /** A single of multiple accessor functions for getting the values along the Y axis. Default: `undefined` */
  @Input() y: NumericAccessor<Datum> | NumericAccessor<Datum>[]

  /** Accessor function for getting the unique data record id. Used for more persistent data updates. Default: `(d, i) => d.id ?? i` */
  @Input() id: ((d: Datum, i?: number, ...rest) => string)

  /** Component color accessor function. Default: `d => d.color` */
  @Input() color: ColorAccessor<Datum | Datum[]>

  /** Scale for X dimension, e.g. Scale.scaleLinear(). If you set xScale you'll be responsible for setting it's `domain` and `range` as well.
   * Only continuous scales are supported.
   * Default: `undefined` */
  @Input() xScale: ContinuousScale

  /** Scale for Y dimension, e.g. Scale.scaleLinear(). If you set yScale you'll be responsible for setting it's `domain` and `range` as well.
   * Only continuous scales are supported.
   * Default: `undefined` */
  @Input() yScale: ContinuousScale

  /** Identifies whether the component should be excluded from overall X and Y domain calculations or not.
   * This property can be useful when you want pass individual data to a component and you don't want it to affect
   * the scales of the chart.
   * Default: `false` */
  @Input() excludeFromDomainCalculation: boolean

  /** Callback function to be called on any Brush event.
   * Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}` */
  @Input() onBrush: ((selection?: [number, number], event?: D3BrushEvent<Datum>, userDriven?: boolean) => void)

  /** Callback function to be called on the Brush start event.
   * Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}` */
  @Input() onBrushStart: ((selection?: [number, number], event?: D3BrushEvent<Datum>, userDriven?: boolean) => void)

  /** Callback function to be called on the Brush move event.
   * Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}` */
  @Input() onBrushMove: ((selection?: [number, number], event?: D3BrushEvent<Datum>, userDriven?: boolean) => void)

  /** Callback function to be called on the Brush end event.
   * Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}` */
  @Input() onBrushEnd: ((selection?: [number, number], event?: D3BrushEvent<Datum>, userDriven?: boolean) => void)

  /** Width of the Brush handle. Default: `1` */
  @Input() handleWidth: number

  /** Brush selection in the data space coordinates, can be used to control the selection. Default: `undefined` */
  @Input() selection: [number, number] | null

  /** Allow dragging the selected area as a whole in order to change the selected range. Default: `false` */
  @Input() draggable: boolean

  /** Position of the handle: `Arrangement.Inside` or `Arrangement.Outside`. Default: `Arrangement.Inside` */
  @Input() handlePosition: Arrangement | string

  /** Constraint Brush selection to a minimal length in data units. Default: `undefined` */
  @Input() selectionMinLength: number
  @Input() data: Datum[]

  component: Brush<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Brush<Datum>(this.getConfig())

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

  private getConfig (): BrushConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, xScale, yScale, excludeFromDomainCalculation, onBrush, onBrushStart, onBrushMove, onBrushEnd, handleWidth, selection, draggable, handlePosition, selectionMinLength } = this
    const config = { duration, events, attributes, x, y, id, color, xScale, yScale, excludeFromDomainCalculation, onBrush, onBrushStart, onBrushMove, onBrushEnd, handleWidth, selection, draggable, handlePosition, selectionMinLength }
    const keys = Object.keys(config) as (keyof BrushConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
