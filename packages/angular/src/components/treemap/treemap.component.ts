// !!! This code was automatically generated. You should not change it !!!
import { Component, AfterViewInit, Input, SimpleChanges } from '@angular/core'
import {
  Treemap,
  TreemapConfigInterface,
  ContainerCore,
  VisEventType,
  VisEventCallback,
  NumericAccessor,
  StringAccessor,
  TreemapNode,
  ColorAccessor,
  TreemapTileFunction,
  TreemapDatum,
  HierarchyNodeWithValue,
  FitMode,
  TrimMode,
} from '@unovis/ts'
import { VisCoreComponent } from '../../core'

@Component({
  selector: 'vis-treemap',
  template: '',
  // eslint-disable-next-line no-use-before-define
  providers: [{ provide: VisCoreComponent, useExisting: VisTreemapComponent }],
})
export class VisTreemapComponent<Datum> implements TreemapConfigInterface<Datum>, AfterViewInit {
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


  @Input() id?: ((d: Datum, i: number) => string | number)


  @Input() value?: NumericAccessor<Datum>

  /** Array of accessor functions to defined the nested groups. Default: `[]` */
  @Input() layers: StringAccessor<Datum>[]

  /**  */
  @Input() numberFormat?: (value: number) => string

  /** Function to generate the label text for each tile. Receives the `TreemapNode` and returns a `string`.
   * Default: shows key and formatted value (e.g., "label: value"). */
  @Input() tileLabel?: (node: TreemapNode<Datum>) => string

  /** Color accessor function for tiles. Default: `undefined` */
  @Input() tileColor?: ColorAccessor<TreemapNode<Datum>>

  /** D3 tile function (e.g. `treemapSquarify`, `treemapDice` from `d3-hierarchy`). Default: `undefined`. */
  @Input() tileFunction?: TreemapTileFunction<TreemapDatum<Datum>>

  /** Comparator for sorting hierarchy nodes before layout. Receives two `HierarchyNode`s. Default: `undefined`. */
  @Input() timeSort?: ((a: HierarchyNodeWithValue<Datum>, b: HierarchyNodeWithValue<Datum>) => number) | null

  /** Padding passed to D3 treemap layout. Default: `2` */
  @Input() tilePadding?: number

  /** Top padding passed to D3 treemap layout.
   * Useful to make room for internal node labels.
   * Default: `undefined` */
  @Input() tilePaddingTop?: number

  /** Append SVG `<title>` element to tile rects. It will be shown when hovering over the tile. Default: `false` */
  @Input() tileShowHtmlTooltip?: boolean

  /** Label internal nodes. Default: `false` */
  @Input() labelInternalNodes?: boolean

  /** Label offset in the X direction. Default: `4` */
  @Input() labelOffsetX?: number

  /** Label offset in the Y direction. Default: `4` */
  @Input() labelOffsetY?: number

  /** How labels should fit within tiles: wrap or trim. Applicable only for leaf nodes. Default: `FitMode.Wrap` */
  @Input() labelFit?: FitMode

  /** Label trimming mode. Default: `TrimMode.Middle` */
  @Input() labelTrimMode?: TrimMode

  /** Border radius of the tiles in pixels. Default: `2` */
  @Input() tileBorderRadius?: number

  /** Minimum fraction of width for border radius. Default: `1/8` */
  @Input() tileBorderRadiusFactor?: number

  /** Enable lightness variance for sibling tiles. Default: `false` */
  @Input() enableLightnessVariance?: boolean

  /** Enable font size variation for leaf node labels based on value. Default: `false` */
  @Input() enableTileLabelFontSizeVariation?: boolean

  /** Small font size for leaf labels (used when `enableTileLabelFontSizeVariation` is `true`). Default: `8` */
  @Input() tileLabelSmallFontSize?: number

  /** Medium font size for leaf labels (used when `enableTileLabelFontSizeVariation` is `true`). Default: `12` */
  @Input() tileLabelMediumFontSize?: number

  /** Large font size for leaf labels (used when `enableTileLabelFontSizeVariation` is `true`). Default: `24` */
  @Input() tileLabelLargeFontSize?: number

  /** Flag for showing cursor:pointer to indicate leaf tiles are clickable. Default: `undefined` */
  @Input() showTileClickAffordance?: boolean

  /** Amount of lightness variation applied to sibling tiles when `enableLightnessVariance` is `true`. Default: `0.08` */
  @Input() lightnessVariationAmount?: number

  /** Minimum size for labels in pixels. Default: `20` */
  @Input() minTileSizeForLabel?: number
  @Input() data: Datum[]

  component: Treemap<Datum> | undefined
  public componentContainer: ContainerCore | undefined

  ngAfterViewInit (): void {
    this.component = new Treemap<Datum>(this.getConfig())

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

  private getConfig (): TreemapConfigInterface<Datum> {
    const { duration, events, attributes, id, value, layers, numberFormat, tileLabel, tileColor, tileFunction, timeSort, tilePadding, tilePaddingTop, tileShowHtmlTooltip, labelInternalNodes, labelOffsetX, labelOffsetY, labelFit, labelTrimMode, tileBorderRadius, tileBorderRadiusFactor, enableLightnessVariance, enableTileLabelFontSizeVariation, tileLabelSmallFontSize, tileLabelMediumFontSize, tileLabelLargeFontSize, showTileClickAffordance, lightnessVariationAmount, minTileSizeForLabel } = this
    const config = { duration, events, attributes, id, value, layers, numberFormat, tileLabel, tileColor, tileFunction, timeSort, tilePadding, tilePaddingTop, tileShowHtmlTooltip, labelInternalNodes, labelOffsetX, labelOffsetY, labelFit, labelTrimMode, tileBorderRadius, tileBorderRadiusFactor, enableLightnessVariance, enableTileLabelFontSizeVariation, tileLabelSmallFontSize, tileLabelMediumFontSize, tileLabelLargeFontSize, showTileClickAffordance, lightnessVariationAmount, minTileSizeForLabel }
    const keys = Object.keys(config) as (keyof TreemapConfigInterface<Datum>)[]
    keys.forEach(key => { if (config[key] === undefined) delete config[key] })

    return config
  }
}
