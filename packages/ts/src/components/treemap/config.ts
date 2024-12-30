import { ComponentConfigInterface, ComponentDefaultConfig } from 'core/component/config'
import { TreemapNode } from 'types'
import { ColorAccessor, NumericAccessor, StringAccessor } from 'types/accessor'

export interface TreemapConfigInterface<Datum> extends ComponentConfigInterface {
  id?: ((d: Datum, i: number) => string | number);
  /* Numeric accessor for segment size value. Default: `undefined`. */
  value?: NumericAccessor<Datum>;

  /** Array of accessor functions to defined the nested groups  */
  layers: StringAccessor<Datum>[];

  /** Color accessor function for tiles. Default: `undefined` */
  tileColor?: ColorAccessor<TreemapNode<Datum>>;
  /** Tile label accessor function. Default `undefined` */
  tileLabel?: StringAccessor<TreemapNode<Datum>>;
  /** Color accessor function for tile labels */
  tileLabelColor?: ColorAccessor<TreemapNode<Datum>>;
  color?: ColorAccessor<Datum>;
}

export const TreemapDefaultConfig: TreemapConfigInterface<unknown> = {
  ...ComponentDefaultConfig,
  id: (d: unknown, i: number): string | number => (d as { id: string }).id ?? i,
  value: undefined,
  color: undefined,
  layers: [],
}
