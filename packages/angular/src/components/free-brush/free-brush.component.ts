// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import { FreeBrush, FreeBrushConfigInterface, ContainerCore, VisEventType, VisEventCallback, FreeBrushMode, FreeBrushSelection } from '@unovis/ts'
import { D3BrushEvent } from 'd3-brush'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-free-brush',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisFreeBrushComponent }],
  standalone: false,
})
export class VisFreeBrushComponent<Datum> implements FreeBrushConfigInterface<Datum>, AfterViewInit {
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

  /** Brush selection mode. X - horizontal, Y - vertical, XY - both. Default: `FreeBrushMode.X` */
  @Input() mode?: FreeBrushMode

  /** Callback function to be called on any Brush event.
   * Default: `(selection: FreeBrushSelection, event: D3BrushEvent<Datum>, userDriven: boolean): void => {}` */
  @Input() onBrush?: ((selection: FreeBrushSelection | undefined, event: D3BrushEvent<unknown>, userDriven: boolean) => void)

  /** Callback function to be called on the Brush start event.
   * Default: `(selection: FreeBrushSelection, event: D3BrushEvent<unknown>, userDriven: boolean): void => {}` */
  @Input() onBrushStart?: ((selection: FreeBrushSelection | undefined, event: D3BrushEvent<unknown>, userDriven: boolean) => void)

  /** Callback function to be called on the Brush move event.
   * Default: `(selection: FreeBrushSelection, event: D3BrushEvent<unknown>, userDriven: boolean): void => {}` */
  @Input() onBrushMove?: ((selection: FreeBrushSelection | undefined, event: D3BrushEvent<unknown>, userDriven: boolean) => void)

  /** Callback function to be called on the Brush end event.
   * Default: `(selection: FreeBrushSelection, event: D3BrushEvent<unknown>, userDriven: boolean)L void => {}` */
  @Input() onBrushEnd?: ((selection: FreeBrushSelection | undefined, event: D3BrushEvent<unknown>, userDriven: boolean) => void)

  /** Width of the Brush handle. Default: `1` */
  @Input() handleWidth?: number

  /** Brush selection in data space, can be used to force set the selection from outside.
   * In case of two dimensional mode, the selection has the following format: `[[xMin, xMax], [yMin, yMax]]`.
   * This config property gets updated on internal brush events. Default: `undefined` */
  @Input() selection?: FreeBrushSelection | null | undefined

  /** Constraint Brush selection to a minimal length in data units. Default: `undefined` */
  @Input() selectionMinLength?: number | [number, number]

  /** Automatically hide the brush after selection. Default: `true` */
  @Input() autoHide?: boolean
  @Input() data: Datum[]

  component: FreeBrush<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new FreeBrush<Datum>(this.getConfig())

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

  private getConfig (): FreeBrushConfigInterface<Datum> {
    const { duration, events, attributes, mode, onBrush, onBrushStart, onBrushMove, onBrushEnd, handleWidth, selection, selectionMinLength, autoHide } = this
    const config = { duration, events, attributes, mode, onBrush, onBrushStart, onBrushMove, onBrushEnd, handleWidth, selection, selectionMinLength, autoHide }
    const keys = Object.keys(config) as (keyof FreeBrushConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
