import { ComponentConfigInterface, ComponentDefaultConfig } from 'core/component/config'
import { ColorAccessor, NumericAccessor, StringAccessor } from 'types/accessor'
import { FitMode } from 'types/text'
import { TreemapNode } from './types'

export interface TreemapConfigInterface<Datum> extends ComponentConfigInterface {
  id?: ((d: Datum, i: number) => string | number);
  /* Numeric accessor for segment size value. Default: `undefined`. */
  value?: NumericAccessor<Datum>;

  /** Array of accessor functions to defined the nested groups. Default: `[]` */
  layers: StringAccessor<Datum>[];

  /** @deprecated Define `tileLabel` instead.
   * A function that accepts a value number and returns a string. Default: `(value: number) => `${value}`` */
  numberFormat?: (value: number) => string;

  /**
   * Function to generate the label text for each tile. Receives the `TreemapNode` and returns a `string`.
   * Default: shows key and formatted value (e.g., "label: value").
   */
  tileLabel?: (node: TreemapNode<Datum>) => string;

  /** Color accessor function for tiles. Default: `undefined` */
  tileColor?: ColorAccessor<TreemapNode<Datum>>;

  /** Padding passed to D3 treemap layout. Default: `2` */
  tilePadding?: number;

  /**
   * Top padding passed to D3 treemap layout.
   * Useful to make room for internal node labels.
   * Default: `undefined`
   */
  tilePaddingTop?: number;

  /** Label internal nodes. Default: `false` */
  labelInternalNodes?: boolean;

  /** Label offset in the X direction. Default: `4` */
  labelOffsetX?: number;

  /** Label offset in the Y direction. Default: `4` */
  labelOffsetY?: number;

  /** How labels should fit within tiles: wrap or trim. Default: `FitMode.Trim` */
  labelFit?: FitMode;

  /** Border radius of the tiles in pixels. Default: `2` */
  tileBorderRadius?: number;

  /** Minimum fraction of width for border radius. Default: `1/8` */
  tileBorderRadiusFactor?: number;

  /** Enable lightness variance for sibling tiles. Default: `false` */
  enableLightnessVariance?: boolean;

  /** Enable font size variation for leaf node labels based on value. Default: `false` */
  enableTileLabelFontSizeVariation?: boolean;

  /** Small font size for leaf labels (used when enableTileLabelFontSizeVariation is true). Default: `8` */
  tileLabelSmallFontSize?: number;

  /** Medium font size for leaf labels (used when enableTileLabelFontSizeVariation is true). Default: `12` */
  tileLabelMediumFontSize?: number;

  /** Large font size for leaf labels (used when enableTileLabelFontSizeVariation is true). Default: `24` */
  tileLabelLargeFontSize?: number;


  /** Flag for showing cursor:pointer to indicate leaf tiles are clickable. Default: `undefined` */
  showTileClickAffordance?: boolean;

  /** Amount of lightness variation applied to sibling tiles when enableLightnessVariance is true. Default: `0.08` */
  lightnessVariationAmount?: number;

  /** Minimum size for labels in pixels. Default: `20` */
  minTileSizeForLabel?: number;
}

export const TreemapDefaultConfig: TreemapConfigInterface<unknown> = {
  ...ComponentDefaultConfig,
  id: (d: unknown, i: number): string | number => (d as { id: string }).id ?? i,
  value: undefined,
  tileColor: undefined,
  layers: [],
  tilePadding: 2,
  tilePaddingTop: undefined,
  labelInternalNodes: false,
  labelOffsetX: 4,
  labelOffsetY: 4,
  labelFit: FitMode.Wrap,
  tileBorderRadius: 2,
  tileBorderRadiusFactor: 1 / 8,
  enableLightnessVariance: false,
  enableTileLabelFontSizeVariation: true,
  tileLabelSmallFontSize: 8,
  tileLabelMediumFontSize: 12,
  tileLabelLargeFontSize: 22,
  showTileClickAffordance: false,
  lightnessVariationAmount: 0.08,
  minTileSizeForLabel: 20,
  numberFormat: (value: number) => `${value}`,
  tileLabel: function (d: TreemapNode<unknown>): string { return `${d.data.key}: ${this.numberFormat(d.value)}` },
}
