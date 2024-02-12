// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  NestedDonut,
  NestedDonutConfigInterface,
  ContainerCore,
  VisEventType,
  VisEventCallback,
  NestedDonutDirection,
  NumericAccessor,
  NestedDonutSegment,
  StringAccessor,
  GenericAccessor,
  NestedDonutLayerSettings,
  ColorAccessor,
} from '@unovis/ts'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-nested-donut',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisCoreComponent, useExisting: VisNestedDonutComponent }],
})
export class VisNestedDonutComponent<Datum> implements NestedDonutConfigInterface<Datum>, AfterViewInit {
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

  /** Diagram angle range. Default: `[0, 2 * Math.PI]` */
  @Input() angleRange?: [number, number]

  /** Direction of hierarchy flow from root to leaf.
   * `NestedDonutDirection.Inwards` starts from the outer most radius and works towards center
   * `NestedDonutDirection.Outwards` starts from the inner most radius the consecutive layers outward.
   * Default: `NestedDonutDirection.Inwards` */
  @Input() direction?: NestedDonutDirection | string


  @Input() value?: NumericAccessor<Datum>

  /** Central label text. Default: `undefined` */
  @Input() centralLabel?: string

  /** Central sub-label accessor function or text. Default: `undefined` */
  @Input() centralSubLabel?: string

  /** Enables wrapping for the sub-label. Default: `true` */
  @Input() centralSubLabelWrap?: boolean

  /** Show donut background. The color is configurable via
   * the `--vis-nested-donut-background-color` and `--vis-dark-nested-donut-background-color` CSS variables.
   * Default: `false` */
  @Input() showBackground?: boolean

  /** Sort function for segments. Default `undefined` */
  @Input() sort?: (a: NestedDonutSegment<Datum>, b: NestedDonutSegment<Datum>) => number

  /** Array of accessor functions to defined the nested groups */
  @Input() layers: StringAccessor<Datum>[]


  @Input() layerSettings?: GenericAccessor<NestedDonutLayerSettings, number>


  @Input() layerPadding?: number

  /** Corner Radius. Default: `0` */
  @Input() cornerRadius?: number

  /** Angular size for empty segments in radians. Default: `Math.PI / 180` */
  @Input() emptySegmentAngle?: number

  /** Hide segment labels when they don't fit. Default: `true` */
  @Input() hideOverflowingSegmentLabels?: boolean

  /** Color accessor function for segments. Default: `undefined` */
  @Input() segmentColor?: ColorAccessor<NestedDonutSegment<Datum>>

  /** Segment label accessor function. Default `undefined` */
  @Input() segmentLabel?: StringAccessor<NestedDonutSegment<Datum>>

  /** Color accessor function for segment labels */
  @Input() segmentLabelColor?: ColorAccessor<NestedDonutSegment<Datum>>

  /** When true, the component will display empty segments (the ones that have `0` values) as tiny slices.
   * Default: `false` */
  @Input() showEmptySegments?: boolean

  /** Show labels for individual segments. Default: `true` */
  @Input() showSegmentLabels?: boolean

  @Input() data: Datum[]

  component: NestedDonut<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new NestedDonut<Datum>(this.getConfig())

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

  private getConfig (): NestedDonutConfigInterface<Datum> {
    const { duration, events, attributes, angleRange, direction, value, centralLabel, centralSubLabel, centralSubLabelWrap, showBackground, sort, layers, layerSettings, layerPadding, cornerRadius, emptySegmentAngle, hideOverflowingSegmentLabels, segmentColor, segmentLabel, segmentLabelColor, showEmptySegments } = this
    const config = { duration, events, attributes, angleRange, direction, value, centralLabel, centralSubLabel, centralSubLabelWrap, showBackground, sort, layers, layerSettings, layerPadding, cornerRadius, emptySegmentAngle, hideOverflowingSegmentLabels, segmentColor, segmentLabel, segmentLabelColor, showEmptySegments }
    const keys = Object.keys(config) as (keyof NestedDonutConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
