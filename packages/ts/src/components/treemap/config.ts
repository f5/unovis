import { ComponentConfigInterface, ComponentDefaultConfig } from 'core/component/config'
import { ColorAccessor, NumericAccessor, StringAccessor } from 'types/accessor'
import { TreemapNode } from './types'

export interface TreemapConfigInterface<Datum> extends ComponentConfigInterface {
  id?: ((d: Datum, i: number) => string | number);
  /* Numeric accessor for segment size value. Default: `undefined`. */
  value?: NumericAccessor<Datum>;

  /** Array of accessor functions to defined the nested groups. Default: `[]` */
  layers: StringAccessor<Datum>[];

  /** A function that accepts a value number and returns a string. Default: `undefined` */
  numberFormat?: (value: number) => string;

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

  /** Border radius of the tiles in pixels. Default: `2` */
  tileBorderRadius?: number;

  /** Enable lightness variance for sibling tiles. Default: `false` */
  enableLightnessVariance?: boolean;

  /** Enable font size variation for leaf node labels based on value. Default: `false` */
  enableTileLabelFontSizeVariation?: boolean;

  /** Minimum font size in pixels for leaf node labels when font size variation is enabled. Default: `8` */
  tileLabelMinFontSize?: number;

  /** Maximum font size in pixels for leaf node labels when font size variation is enabled. Default: `32` */
  tileLabelMaxFontSize?: number;
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
  tileBorderRadius: 2,
  enableLightnessVariance: false,
  enableTileLabelFontSizeVariation: true,
  tileLabelMinFontSize: 8,
  tileLabelMaxFontSize: 48,
}
