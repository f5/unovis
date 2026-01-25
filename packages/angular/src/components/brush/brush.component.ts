// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { Brush, BrushConfigInterface, ContainerCore, VisEventType, VisEventCallback, Arrangement } from '@unovis/ts'
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
  @Input() duration?: number

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
  @Input() events?: {
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
  @Input() attributes?: {
    [selector: string]: {
      [attr: string]: string | number | boolean | ((datum: any) => string | number | boolean);
    };
  }

  /** Callback function to be called on any Brush event.
   * Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}` */
  @Input() onBrush?: ((selection: [number, number] | undefined, event: D3BrushEvent<Datum>, userDriven: boolean) => void)

  /** Callback function to be called on the Brush start event.
   * Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}` */
  @Input() onBrushStart?: ((selection: [number, number] | undefined, event: D3BrushEvent<Datum>, userDriven: boolean) => void)

  /** Callback function to be called on the Brush move event.
   * Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}` */
  @Input() onBrushMove?: ((selection: [number, number] | undefined, event: D3BrushEvent<Datum>, userDriven: boolean) => void)

  /** Callback function to be called on the Brush end event.
   * Default: `(selection: [number, number], event: D3BrushEvent<Datum>, userDriven: boolean): void => {}` */
  @Input() onBrushEnd?: ((selection: [number, number] | undefined, event: D3BrushEvent<Datum>, userDriven: boolean) => void)

  /** Width of the Brush handle. Default: `1` */
  @Input() handleWidth?: number

  /** Brush selection in the data space coordinates, can be used to control the selection. Default: `undefined` */
  @Input() selection?: [number, number] | null

  /** Allow dragging the selected area as a whole in order to change the selected range. Default: `false` */
  @Input() draggable?: boolean

  /** Position of the handle: `Arrangement.Inside` or `Arrangement.Outside`. Default: `Arrangement.Inside` */
  @Input() handlePosition?: Arrangement.Inside | Arrangement.Outside | string

  /** Constraint Brush selection to a minimal length in data units. Default: `undefined` */
  @Input() selectionMinLength?: number

  /** Extend the brush height by the specified number of pixels. This can be convenient when you have thick lines
   * at the bottom of the chart and you want to ensure they stay fully covered by the brush. Default: `0` */
  @Input() brushHeightExtend?: number
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
    const { duration, events, attributes, onBrush, onBrushStart, onBrushMove, onBrushEnd, handleWidth, selection, draggable, handlePosition, selectionMinLength, brushHeightExtend } = this
    const config = { duration, events, attributes, onBrush, onBrushStart, onBrushMove, onBrushEnd, handleWidth, selection, draggable, handlePosition, selectionMinLength, brushHeightExtend }
    const keys = Object.keys(config) as (keyof BrushConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
