/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  XYLabels,
  XYLabelsConfigInterface,
  ContainerCore,
  VisEventType,
  VisEventCallback,
  NumericAccessor,
  ColorAccessor,
  ContinuousScale,
  GenericAccessor,
  XYLabelPositioning,
  StringAccessor,
  XYLabel,
} from '@volterra/vis'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-xy-labels',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisXYLabelsComponent }],
})
export class VisXYLabelsComponent<Datum> implements XYLabelsConfigInterface<Datum>, AfterViewInit {
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

  /** Single Y accessor function. Default: `undefined` */
  @Input() y: NumericAccessor<Datum>

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

  /** Defines how to position the label horizontally: in data space or in screen space. Default: `LabelPositioning.DataSpace` */
  @Input() xPositioning: GenericAccessor<XYLabelPositioning, Datum>

  /** Defines how to position the label vertically: in data space or in screen space. Default: `LabelPositioning.DataSpace` */
  @Input() yPositioning: GenericAccessor<XYLabelPositioning, Datum>

  /** Font size accessor function or constant value in pixels. Default: `12` */
  @Input() labelFontSize: NumericAccessor<Datum>

  /** Label accessor function or string. Default: `undefined` */
  @Input() label: StringAccessor<Datum>

  /** Label color. Default: `undefined` */
  @Input() backgroundColor: ColorAccessor<Datum>

  /** Optional label cursor. Default: `null` */
  @Input() cursor: StringAccessor<Datum>

  /** Label color brightness ratio for switching between dark and light text label color. Default: `0.65` */
  @Input() labelTextBrightnessRatio: number

  /** Enable label clustering. Default: `true` */
  @Input() clustering: boolean

  /** Label accessor for clusters. Default: `undefined` */
  @Input() clusterLabel: StringAccessor<XYLabel<Datum>[]>

  /** Font size accessor for clusters, the value is in pixels. Default: `14` */
  @Input() clusterFontSize: NumericAccessor<XYLabel<Datum>[]>

  /** Background color accessor for clusters. Default: `undefined` */
  @Input() clusterBackgroundColor: ColorAccessor<XYLabel<Datum>[]>

  /** Optional cluster cursor. Default: `null` */
  @Input() clusterCursor: StringAccessor<XYLabel<Datum>[]>

  /** Cluster label color accessor function. Default: `null` */
  @Input() clusterLabelColor: ColorAccessor<XYLabel<Datum>[]>
  @Input() data: Datum[]

  component: XYLabels<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new XYLabels<Datum>(this.getConfig())

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

  private getConfig (): XYLabelsConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, xScale, yScale, excludeFromDomainCalculation, xPositioning, yPositioning, labelFontSize, label, backgroundColor, cursor, labelTextBrightnessRatio, clustering, clusterLabel, clusterFontSize, clusterBackgroundColor, clusterCursor, clusterLabelColor } = this
    const config = { duration, events, attributes, x, y, id, color, xScale, yScale, excludeFromDomainCalculation, xPositioning, yPositioning, labelFontSize, label, backgroundColor, cursor, labelTextBrightnessRatio, clustering, clusterLabel, clusterFontSize, clusterBackgroundColor, clusterCursor, clusterLabelColor }
    const keys = Object.keys(config) as (keyof XYLabelsConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
