// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Plotband,
  PlotbandConfigInterface,
  ContainerCore,
  VisEventType,
  VisEventCallback,
  AxisType,
  PlotbandLabelPosition,
  PlotbandLabelOrientation,
} from '@unovis/ts'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-plotband',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisPlotbandComponent }],
})
export class VisPlotbandComponent<Datum> implements PlotbandConfigInterface<Datum>, AfterViewInit {
  /** Duration of the animation in milliseconds. */
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

  /** Axis to draw the plotband on. */
  @Input() axis?: AxisType

  /** Start coordinate for the plotband. */
  @Input() from?: number | null | undefined

  /** End coordinate for the plotband. */
  @Input() to?: number | null | undefined

  /** Optional text to display on the plotband */
  @Input() labelText?: string

  /** Position of the label relative to the plotband area (e.g., 'top-left-outside').
   * Can be customized with a string. */
  @Input() labelPosition?: PlotbandLabelPosition

  /** Horizontal offset (in pixels) for positioning the label. */
  @Input() labelOffsetX?: number

  /** Vertical offset (in pixels) for positioning the label. */
  @Input() labelOffsetY?: number

  /** Orientation of the label text. */
  @Input() labelOrientation?: PlotbandLabelOrientation

  /** Optional color for the label text */
  @Input() labelColor?: string

  /** Font size (in pixels) for the label text.
   * Uses the CSS variable `--vis-plotband-label-font-size` by default, which resolves to `12px`. */
  @Input() labelSize?: number

  component: Plotband<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Plotband<Datum>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    this.component?.setConfig(this.getConfig())
    this.componentContainer?.render()
  }

  private getConfig (): PlotbandConfigInterface<Datum> {
    const { duration, events, attributes, axis, from, to, labelText, labelPosition, labelOffsetX, labelOffsetY, labelOrientation, labelColor, labelSize } = this
    const config = { duration, events, attributes, axis, from, to, labelText, labelPosition, labelOffsetX, labelOffsetY, labelOrientation, labelColor, labelSize }
    const keys = Object.keys(config) as (keyof PlotbandConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
