// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Boxplot,
  BoxplotConfigInterface,
  ContainerCore,
  VisEventType,
  VisEventCallback,
  NumericAccessor,
  ColorAccessor,
  ContinuousScale,
  GenericAccessor,
  StringAccessor,
} from '@unovis/ts'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-boxplot',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisBoxplotComponent }],
})
export class VisBoxplotComponent<Datum> implements BoxplotConfigInterface<Datum>, AfterViewInit {
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

  /** Box fill color accessor function. Default: `d => d.color` */
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

  /** Median accessor function. Defines the position of the median line inside the box.
   * Default: `undefined` */
  @Input() median?: NumericAccessor<Datum>

  /** Quartiles accessor function returning a `[q1, q3]` tuple. Defines the bottom and the top of the box.
   * Default: `undefined` */
  @Input() quartiles?: GenericAccessor<[number, number], Datum>

  /** Whiskers accessor function returning a `[min, max]` tuple. Defines the bottom and the top whisker ends.
   * Default: `undefined` */
  @Input() whiskers?: GenericAccessor<[number, number], Datum>

  /** Force set the box width in pixels. Default: `undefined` */
  @Input() barWidth?: number

  /** Maximum box width for dynamic sizing. Default: `undefined` */
  @Input() barMaxWidth?: number

  /** Expected step between the boxes in the X axis units. When the data has missing points the step
   * can't be inferred reliably from the data, so set it explicitly here to size the boxes correctly.
   * Default: `undefined` */
  @Input() dataStep?: number

  /** Fractional padding between the boxes in the range of [0,1). Default: `0.25` */
  @Input() barPadding?: number

  /** Rounded corners for the box. Boolean or number (to set the radius in pixels). Default: `2` */
  @Input() roundedCorners?: number | boolean

  /** Configurable box cursor when hovering over. Default: `null` */
  @Input() cursor?: StringAccessor<Datum>
  @Input() data: Datum[]

  component: Boxplot<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Boxplot<Datum>(this.getConfig())

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

  private getConfig (): BoxplotConfigInterface<Datum> {
    const { duration, events, attributes, x, id, color, xScale, yScale, excludeFromDomainCalculation, median, quartiles, whiskers, barWidth, barMaxWidth, dataStep, barPadding, roundedCorners, cursor } = this
    const config = { duration, events, attributes, x, id, color, xScale, yScale, excludeFromDomainCalculation, median, quartiles, whiskers, barWidth, barMaxWidth, dataStep, barPadding, roundedCorners, cursor }
    const keys = Object.keys(config) as (keyof BoxplotConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
