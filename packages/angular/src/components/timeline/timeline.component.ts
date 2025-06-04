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
  GenericAccessor,
  Arrangement,
  TimelineRowLabel,
  TimelineRowIcon,
  TextAlign,
  TimelineArrow,
  TimelineLineRenderState,
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

  /**  */
  @Input() type?: StringAccessor<Datum>

  /**  */
  @Input() length?: NumericAccessor<Datum>

  /**  */
  @Input() cursor?: StringAccessor<Datum>

  /** Timeline item row accessor function. Records with the `lineRow` will be plotted in one row. Default: `undefined` */
  @Input() lineRow?: StringAccessor<Datum>

  /** Timeline item duration accessor function. Default: `undefined`. Falls back to the deprecated `length` property */
  @Input() lineDuration?: NumericAccessor<Datum>

  /** Width of the timeline items. Default: `8` */
  @Input() lineWidth?: NumericAccessor<Datum>

  /** Display rounded ends for timeline items. Default: `true` */
  @Input() lineCap?: boolean

  /** Provide a href to an SVG defined in container's `svgDefs` to display an icon at the start of the line. Default: undefined */
  @Input() lineStartIcon?: StringAccessor<Datum>

  /** Line start icon color accessor function. Default: `undefined` */
  @Input() lineStartIconColor?: StringAccessor<Datum>

  /** Line start icon size accessor function. Default: `undefined` */
  @Input() lineStartIconSize?: NumericAccessor<Datum>

  /** Line start icon arrangement configuration. Controls how the icon is positioned relative to the line.
   * Accepts values from the Arrangement enum: `Arrangement.Start`, `Arrangement.Middle`, `Arrangement.End` or a string equivalent.
   * Default: `Arrangement.Inside` */
  @Input() lineStartIconArrangement?: GenericAccessor<Arrangement | any, Datum>

  /** Provide a href to an SVG defined in container's `svgDefs` to display an icon at the end of the line. Default: undefined */
  @Input() lineEndIcon?: StringAccessor<Datum>

  /** Line end icon color accessor function. Default: `undefined` */
  @Input() lineEndIconColor?: StringAccessor<Datum>

  /** Line end icon size accessor function. Default: `undefined` */
  @Input() lineEndIconSize?: NumericAccessor<Datum>

  /** Line end icon arrangement configuration. Controls how the icon is positioned relative to the line.
   * Accepts values from the Arrangement enum: `Arrangement.Start`, `Arrangement.Middle`, `Arrangement.End` or a string equivalent.
   * Default: `Arrangement.Inside` */
  @Input() lineEndIconArrangement?: GenericAccessor<Arrangement | any, Datum>

  /** Configurable Timeline item cursor when hovering over. Default: `undefined` */
  @Input() lineCursor?: StringAccessor<Datum>

  /** Sets the minimum line length to 1 pixel for better visibility of small values. Default: `false` */
  @Input() showEmptySegments?: boolean

  /** Timeline row height. Default: `22` */
  @Input() rowHeight?: number

  /** Alternating row colors. Default: `true` */
  @Input() alternatingRowColors?: boolean

  /**  */
  @Input() showLabels?: boolean

  /**  */
  @Input() labelWidth?: number

  /**  */
  @Input() maxLabelWidth?: number

  /** Show row labels when set to `true`. Default: `false`. Falls back to deprecated `showLabels` */
  @Input() showRowLabels?: boolean

  /** Row label style as an object with the `{ [property-name]: value }` format. Default: `undefined` */
  @Input() rowLabelStyle?: GenericAccessor<Record<string, string>, TimelineRowLabel<Datum>>

  /** Row label formatter function. Default: `undefined` */
  @Input() rowLabelFormatter?: (key: string, items: Datum[], i: number) => string

  /** Provide an icon href to be displayed before the row label. Default: `undefined` */
  @Input() rowIcon?: (key: string, items: Datum[], i: number) => TimelineRowIcon | undefined

  /** Fixed label width in pixels. Labels longer than the specified value will be trimmed. Default: `undefined`. Falls back to deprecated `labelWidth`. */
  @Input() rowLabelWidth?: number

  /** Maximum label width in pixels. Labels longer than the specified value will be trimmed. Default: `undefined`. Falls back to deprecated `maxLabelWidth`. */
  @Input() rowMaxLabelWidth?: number

  /** Text alignment for labels: `TextAlign.Left`, `TextAlign.Center` or `TextAlign.Right`. Default: `TextAlign.Right` */
  @Input() rowLabelTextAlign?: TextAlign | any


  @Input() arrows?: TimelineArrow[]

  /** Control the animation by specify the initial position for new lines as [x, y]. Default: `undefined` */
  @Input() animationLineEnterPosition?: [number | undefined | null, number | undefined | null] | ((d: Datum & TimelineLineRenderState, i: number, data: (Datum & TimelineLineRenderState)[]) => [number | undefined, number | undefined]) | undefined

  /** Control the animation by specify the destination position for exiting lines as [x, y]. Default: `undefined` */
  @Input() animationLineExitPosition?: [number | undefined | null, number | undefined | null] | ((d: Datum & TimelineLineRenderState, i: number, data: (Datum & TimelineLineRenderState)[]) => [number | undefined, number | undefined]) | undefined

  /** Scrolling callback function: `(scrollTop: number) => void`. Default: `undefined` */
  @Input() onScroll?: (scrollTop: number) => void
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
    const { duration, events, attributes, x, id, color, xScale, yScale, excludeFromDomainCalculation, type, length, cursor, lineRow, lineDuration, lineWidth, lineCap, lineStartIcon, lineStartIconColor, lineStartIconSize, lineStartIconArrangement, lineEndIcon, lineEndIconColor, lineEndIconSize, lineEndIconArrangement, lineCursor, showEmptySegments, rowHeight, alternatingRowColors, showLabels, labelWidth, maxLabelWidth, showRowLabels, rowLabelStyle, rowLabelFormatter, rowIcon, rowLabelWidth, rowMaxLabelWidth, rowLabelTextAlign, arrows, animationLineEnterPosition, animationLineExitPosition, onScroll } = this
    const config = { duration, events, attributes, x, id, color, xScale, yScale, excludeFromDomainCalculation, type, length, cursor, lineRow, lineDuration, lineWidth, lineCap, lineStartIcon, lineStartIconColor, lineStartIconSize, lineStartIconArrangement, lineEndIcon, lineEndIconColor, lineEndIconSize, lineEndIconArrangement, lineCursor, showEmptySegments, rowHeight, alternatingRowColors, showLabels, labelWidth, maxLabelWidth, showRowLabels, rowLabelStyle, rowLabelFormatter, rowIcon, rowLabelWidth, rowMaxLabelWidth, rowLabelTextAlign, arrows, animationLineEnterPosition, animationLineExitPosition, onScroll }
    const keys = Object.keys(config) as (keyof TimelineConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
