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
}
