// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Timeline,
  TimelineConfigInterface,
  ContainerCore,
  VisEventType,
  VisEventCallback,
  NumericAccessor,
  ColorAccessor,
  ContinuousScale,
  StringAccessor,
} from '@unovis/ts'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-timeline',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisTimelineComponent }],
})
export class VisTimelineComponent<Datum> implements TimelineConfigInterface<Datum>, AfterViewInit {
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

  /** Accessor function for getting the values along the X axis. Default: `undefined` */
  @Input() x: NumericAccessor<Datum>

  /** Accessor function for getting the unique data record id. Used for more persistent data updates. Default: `(d, i) => d.id ?? i` */
  @Input() id?: ((d: Datum, i: number, ...rest) => string)

  /** Timeline item color accessor function. Default: `d => d.color` */
  @Input() color?: ColorAccessor<Datum>

  /** Scale for X dimension, e.g. Scale.scaleLinear(). If you set xScale you'll be responsible for setting it's `domain` and `range` as well.
   * Only continuous scales are supported.
   * Default: `undefined` */
  @Input() xScale?: ContinuousScale

  /** Scale for Y dimension, e.g. Scale.scaleLinear(). If you set yScale you'll be responsible for setting it's `domain` and `range` as well.
   * Only continuous scales are supported.
   * Default: `undefined` */
  @Input() yScale?: ContinuousScale

  /** Identifies whether the component should be excluded from overall X and Y domain calculations or not.
   * This property can be useful when you want pass individual data to a component and you don't want it to affect
   * the scales of the chart.
   * Default: `false` */
  @Input() excludeFromDomainCalculation?: boolean

  /** Width of the timeline items. Default: `8` */
  @Input() lineWidth?: NumericAccessor<Datum>

  /** Display rounded ends for timeline items. Default: `true` */
  @Input() lineCap?: boolean

  /** Timeline row height. Default: `22` */
  @Input() rowHeight?: number

  /** Timeline item length accessor function. Default: `d => d.length` */
  @Input() length?: NumericAccessor<Datum>

  /** Timeline item type accessor function. Records of one type will be plotted in one row. Default: `d => d.type` */
  @Input() type?: StringAccessor<Datum>

  /** Configurable Timeline item cursor when hovering over. Default: `null` */
  @Input() cursor?: StringAccessor<Datum>

  /** Show item type labels when set to `true`. Default: `false` */
  @Input() showLabels?: boolean

  /** Fixed label width in pixels. Labels longer than the specified value will be trimmed. Default: `undefined` */
  @Input() labelWidth?: number

  /** Maximum label width in pixels. Labels longer than the specified value will be trimmed. Default: `120` */
  @Input() maxLabelWidth?: number

  /** Alternating row colors. Default: `true` */
  @Input() alternatingRowColors?: boolean

  /** Scrolling callback function: `(scrollTop: number) => void`. Default: `undefined` */
  @Input() onScroll?: (scrollTop: number) => void

  /** Sets the minimum line length to 1 pixel for better visibility of small values. Default: `false` */
  @Input() showEmptySegments?: boolean
  @Input() data: Datum[]

  component: Timeline<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Timeline<Datum>(this.getConfig())

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

  private getConfig (): TimelineConfigInterface<Datum> {
    const { duration, events, attributes, x, id, color, xScale, yScale, excludeFromDomainCalculation, lineWidth, lineCap, rowHeight, length, type, cursor, showLabels, labelWidth, maxLabelWidth, alternatingRowColors, onScroll, showEmptySegments } = this
    const config = { duration, events, attributes, x, id, color, xScale, yScale, excludeFromDomainCalculation, lineWidth, lineCap, rowHeight, length, type, cursor, showLabels, labelWidth, maxLabelWidth, alternatingRowColors, onScroll, showEmptySegments }
    const keys = Object.keys(config) as (keyof TimelineConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
