/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Scatter,
  ScatterConfigInterface,
  VisEventType,
  VisEventCallback,
  NumericAccessor,
  ColorAccessor,
  ContinuousScale,
  SymbolType,
  StringAccessor,
} from '@volterra/vis'
import { VisXYComponent } from '../../core'

@Component({
  selector: 'vis-scatter',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisXYComponent, useExisting: VisScatterComponent }],
})
export class VisScatterComponent<Datum> implements ScatterConfigInterface<Datum>, AfterViewInit {
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

  /** X and Y scales. As of now, only continuous scales are supported. Default: `{ x: Scale.scaleLinear(), y: Scale.scaleLinear() } */
  @Input() scales: {
    x?: ContinuousScale;
    y?: ContinuousScale;
  }

  /** Sets the Y scale domain based on the X scale domain not the whole data. Useful when you manipulate chart's X domain from outside. Default: `false` */
  @Input() scaleByDomain: boolean

  /** Size accessor function or constant value in relative units. Default: `1` */
  @Input() size: NumericAccessor<Datum>

  /** Size scale. Default: `Scale.scaleLinear()` */
  @Input() sizeScale: ContinuousScale

  /** Size Range, [number, number]. Default: `[5, 20]` */
  @Input() sizeRange: [number, number]

  /** Shape of the scatter point. Accessor function or constant value: `SymbolType.Circle`, `SymbolType.Cross`, `SymbolType.Diamond`, `SymbolType.Square`,
   * `SymbolType.Star`, `SymbolType.Triangle` or `SymbolType.Wye`.
   * Default: `SymbolType.Circle` */
  @Input() shape: ((d: Datum, i?: number, ...rest) => (SymbolType | string)) | SymbolType | string

  /** Label accessor function or string. Default: `undefined` */
  @Input() label: StringAccessor<Datum>

  /** Label color. Default: `undefined` */
  @Input() labelColor: ColorAccessor<Datum>

  /** Optional point cursor. Default: `null` */
  @Input() cursor: StringAccessor<Datum>

  /** Point color brightness ratio for switching between dark and light text label color. Default: `0.65` */
  @Input() labelTextBrightnessRatio: number
  @Input() data: Datum[]

  component: Scatter<Datum> | undefined

  ngAfterViewInit (): void {
    this.component = new Scatter<Datum>(this.getConfig())
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.data) { this.component?.setData(this.data) }
    this.component?.setConfig(this.getConfig())
  }

  private getConfig (): ScatterConfigInterface<Datum> {
    const { duration, events, attributes, x, y, id, color, scales, scaleByDomain, size, sizeScale, sizeRange, shape, label, labelColor, cursor, labelTextBrightnessRatio } = this
    const config = { duration, events, attributes, x, y, id, color, scales, scaleByDomain, size, sizeScale, sizeRange, shape, label, labelColor, cursor, labelTextBrightnessRatio }
    const keys = Object.keys(config) as (keyof ScatterConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
