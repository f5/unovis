// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  StackedBar,
  StackedBarConfigInterface,
  ContainerCore,
  VisEventType,
  VisEventCallback,
  NumericAccessor,
  ColorAccessor,
  ContinuousScale,
  StringAccessor,
  Orientation,
} from '@unovis/ts'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-stacked-bar',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisStackedBarComponent }],
})
export class VisStackedBarComponent<Datum> implements StackedBarConfigInterface<Datum>, AfterViewInit {
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

  /** A single of multiple accessor functions for getting the values along the Y axis. Default: `undefined` */
  @Input() y: NumericAccessor<Datum> | NumericAccessor<Datum>[]

  /** Accessor function for getting the unique data record id. Used for more persistent data updates. Default: `(d, i) => d.id ?? i` */
  @Input() id?: ((d: Datum, i: number, ...rest) => string)

  /** Bar color accessor function. Default: `d => d.color` */
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

  /** Force set bar width in pixels. Default: `undefined` */
  @Input() barWidth?: number

  /** Maximum bar width for dynamic sizing. Default: `undefined` */
  @Input() barMaxWidth?: number

  /** Expected step between the bars in the X axis units.
   * Needed to correctly calculate the width of the bars when there are gaps in the data.
   * Default: `undefined` */
  @Input() dataStep?: number

  /** Fractional padding between the bars in the range of [0,1). Default: `0` */
  @Input() barPadding?: number

  /** Rounded corners for top bars. Boolean or number (to set the radius in pixels). Default: `2` */
  @Input() roundedCorners?: number | boolean

  /** Configurable bar cursor when hovering over. Default: `null` */
  @Input() cursor?: StringAccessor<Datum>

  /** Sets the minimum bar height to 1 pixel for better visibility of small values. Default: `false` */
  @Input() barMinHeight1Px?: boolean

  /** Base value to test data existence when `barMinHeight1Px` is set to `true`.
   * Everything equal to barMinHeightZeroValue will not be rendered on the chart.
   * Default: `null` */
  @Input() barMinHeightZeroValue?: any

  /** Chart orientation: `Orientation.Vertical` or `Orientation.Horizontal`. Default `Orientation.Vertical` */
  @Input() orientation?: Orientation | string
  @Input() data: Datum[]

  component: StackedBar<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new StackedBar<Datum>(this.getConfig())

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

  private getConfig (): StackedBarConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, xScale, yScale, excludeFromDomainCalculation, barWidth, barMaxWidth, dataStep, barPadding, roundedCorners, cursor, barMinHeight1Px, barMinHeightZeroValue, orientation } = this
    const config = { duration, events, attributes, x, y, id, color, xScale, yScale, excludeFromDomainCalculation, barWidth, barMaxWidth, dataStep, barPadding, roundedCorners, cursor, barMinHeight1Px, barMinHeightZeroValue, orientation }
    const keys = Object.keys(config) as (keyof StackedBarConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
