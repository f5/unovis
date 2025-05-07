// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Plotline,
  PlotlineConfigInterface,
  ContainerCore,
  VisEventType,
  VisEventCallback,
  AxisType,
  PlotlineLineStylePresets,
  PlotlineLegendPosition,
  PlotlineLegendOrientation,
} from '@unovis/ts'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-plotline',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisPlotlineComponent }],
})
export class VisPlotlineComponent<Datum> implements PlotlineConfigInterface<Datum>, AfterViewInit {
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

  /** Line width in pixels. Default: `2` */
  @Input() lineWidth?: number

  /** Plotline direction type: `AxisType.X` or `AxisType.Y` */
  @Input() axis?: AxisType | string

  /** Value to draw the plotline at. Default: `0` */
  @Input() value?: number | null | undefined

  /** Line style, see SVG's stroke-dasharray. Default: `solid` */
  @Input() lineStyle?: PlotlineLineStylePresets | number[]


  @Input() labelText?: string


  @Input() labelPosition: PlotlineLegendPosition


  @Input() labelOffsetX: number


  @Input() labelOffsetY: number


  @Input() labelOrientation: PlotlineLegendOrientation


  @Input() labelColor?: string


  @Input() labelSize?: number

  component: Plotline<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Plotline<Datum>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    this.component?.setConfig(this.getConfig())
    this.componentContainer?.render()
  }

  private getConfig (): PlotlineConfigInterface<Datum> {
    const { duration, events, attributes, lineWidth, axis, value, lineStyle, labelText, labelPosition, labelOffsetX, labelOffsetY, labelOrientation, labelColor, labelSize } = this
    const config = { duration, events, attributes, lineWidth, axis, value, lineStyle, labelText, labelPosition, labelOffsetX, labelOffsetY, labelOrientation, labelColor, labelSize }
    const keys = Object.keys(config) as (keyof PlotlineConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
