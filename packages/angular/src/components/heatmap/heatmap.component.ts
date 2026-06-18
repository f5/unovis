// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Heatmap,
  HeatmapConfigInterface,
  ContainerCore,
  VisEventType,
  VisEventCallback,
  NumericAccessor,
  ColorAccessor,
  HeatmapLayoutType,
  StringAccessor,
} from '@unovis/ts'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-heatmap',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisCoreComponent, useExisting: VisHeatmapComponent }],
})
export class VisHeatmapComponent<Datum> implements HeatmapConfigInterface<Datum>, AfterViewInit {
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

  /** Value accessor function. Drives the cell color. Returning `null` or `undefined` renders an empty cell. Default: `undefined` */
  @Input() value: NumericAccessor<Datum>

  /** Per-cell color accessor function. Takes precedence over `colorRange` when it resolves to a color. Default: `undefined` */
  @Input() color?: ColorAccessor<Datum>

  /** A list of bucket colors used to build a quantized value → color scale when `color` is not set.
   * When `undefined`, a default green sequence is used (configurable via the `--vis-heatmap-color-*` CSS variables). Default: `undefined` */
  @Input() colorRange?: string[]

  /** Explicit `[min, max]` domain for the `colorRange` scale. When `undefined`, the extent of the values is used. Default: `undefined` */
  @Input() colorDomain?: [number, number]

  /** Number of rows in the grid. When `layout` is `HeatmapLayoutType.Column` this is the primary (fixed) dimension. Default: `7` */
  @Input() numRows?: number

  /** Number of columns in the grid. When `layout` is `HeatmapLayoutType.Row` this is the primary (fixed) dimension.
   * When `undefined`, it's derived from the data length and the primary dimension. Default: `undefined` */
  @Input() numColumns?: number

  /** Order in which the linear `data` array fills the grid:
   * `HeatmapLayoutType.Column` fills each column top-to-bottom before moving to the next (GitHub-contributions style),
   * `HeatmapLayoutType.Row` fills each row left-to-right. Default: `HeatmapLayoutType.Column` */
  @Input() layout?: HeatmapLayoutType | `${HeatmapLayoutType}`

  /** Number of empty cells before the first datum. Useful for aligning the first datum to a specific row/column.
   * Equivalent to prepending `offset` empty entries to `data`. Default: `0` */
  @Input() offset?: number

  /** Fixed cell size in pixels. A single number renders square cells; `[width, height]` renders rectangular cells.
   * When unset, cells stretch to fill the container.
   * When set together with the container's `Sizing.Extend`, the component reports its own size. Default: `undefined` */
  @Input() cellSize?: number | [number, number]

  /** Gap between cells in pixels. Default: `2` */
  @Input() cellPadding?: number

  /** Cell corner radius in pixels (or `true` for a default radius of `2`). Default: `2` */
  @Input() cellCornerRadius?: number | boolean

  /** Cell cursor accessor function. Default: `null` */
  @Input() cursor?: StringAccessor<Datum>

  /** Column label accessor, called per column index. Return `undefined` to skip a label. Labels are rendered above the grid. Default: `undefined` */
  @Input() columnLabel?: (columnIndex: number) => string | null | undefined

  /** Row label accessor, called per row index. Return `undefined` to skip a label. Labels are rendered to the left of the grid. Default: `undefined` */
  @Input() rowLabel?: (rowIndex: number) => string | null | undefined

  /** Hide row and column labels that overlap their neighbours. Collisions are resolved independently per axis,
   * keeping the top-most row label and left-most column label of each overlapping group visible. Default: `true` */
  @Input() labelHideOverlapping?: boolean
  @Input() data: Datum[]

  component: Heatmap<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Heatmap<Datum>(this.getConfig())

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

  private getConfig (): HeatmapConfigInterface<Datum> {
    const { duration, events, attributes, value, color, colorRange, colorDomain, numRows, numColumns, layout, offset, cellSize, cellPadding, cellCornerRadius, cursor, columnLabel, rowLabel, labelHideOverlapping } = this
    const config = { duration, events, attributes, value, color, colorRange, colorDomain, numRows, numColumns, layout, offset, cellSize, cellPadding, cellCornerRadius, cursor, columnLabel, rowLabel, labelHideOverlapping }
    const keys = Object.keys(config) as (keyof HeatmapConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
