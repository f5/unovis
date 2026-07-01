// Core
import { ComponentConfigInterface, ComponentDefaultConfig } from 'core/component/config'

// Types
import { ColorAccessor, NumericAccessor, StringAccessor } from 'types/accessor'
import { HeatmapLayoutType } from './types'

export interface HeatmapConfigInterface<Datum> extends ComponentConfigInterface {
  /** Value accessor function. Drives the cell color. Returning `null` or `undefined` renders an empty cell. Default: `undefined` */
  value: NumericAccessor<Datum>;
  /** Per-cell color accessor function. Takes precedence over `colorRange` when it resolves to a color. Default: `undefined` */
  color?: ColorAccessor<Datum>;
  /** A list of bucket colors used to build a quantized value → color scale when `color` is not set.
   * When `undefined`, a default green sequence is used (configurable via the `--vis-heatmap-color-*` CSS variables). Default: `undefined`
   */
  colorRange?: string[];
  /** Explicit `[min, max]` domain for the `colorRange` scale. When `undefined`, the extent of the values is used. Default: `undefined` */
  colorDomain?: [number, number];
  /** Number of rows in the grid. When `layout` is `HeatmapLayoutType.Column` this is the primary (fixed) dimension. Default: `7` */
  numRows?: number;
  /** Number of columns in the grid. When `layout` is `HeatmapLayoutType.Row` this is the primary (fixed) dimension.
   * When `undefined`, it's derived from the data length and the primary dimension. Default: `undefined`
   */
  numColumns?: number;
  /** Order in which the linear `data` array fills the grid:
   * `HeatmapLayoutType.Column` fills each column top-to-bottom before moving to the next (GitHub-contributions style),
   * `HeatmapLayoutType.Row` fills each row left-to-right. Default: `HeatmapLayoutType.Column`
   */
  layout?: HeatmapLayoutType | `${HeatmapLayoutType}`;
  /** Number of empty cells before the first datum. Useful for aligning the first datum to a specific row/column.
   * Equivalent to prepending `offset` empty entries to `data`. Default: `0`
   */
  offset?: number;
  /** Fixed cell size in pixels. A single number renders square cells; `[width, height]` renders rectangular cells.
   * When unset, cells stretch to fill the container.
   * When set together with the container's `Sizing.Extend`, the component reports its own size. Default: `undefined`
   */
  cellSize?: number | [number, number];
  /** Gap between cells in pixels. Default: `2` */
  cellPadding?: number;
  /** Cell corner radius in pixels (or `true` for a default radius of `2`). Default: `2` */
  cellCornerRadius?: number | boolean;
  /** Cell cursor accessor function. Default: `null` */
  cursor?: StringAccessor<Datum>;
  /** Column label accessor, called per column index. Return `undefined` to skip a label. Labels are rendered above the grid. Default: `undefined` */
  columnLabel?: (columnIndex: number) => string | null | undefined;
  /** Row label accessor, called per row index. Return `undefined` to skip a label. Labels are rendered to the left of the grid. Default: `undefined` */
  rowLabel?: (rowIndex: number) => string | null | undefined;
}

export const HeatmapDefaultConfig: HeatmapConfigInterface<unknown> = {
  ...ComponentDefaultConfig,
  value: undefined,
  color: undefined,
  colorRange: undefined,
  colorDomain: undefined,
  numRows: undefined,
  numColumns: undefined,
  layout: HeatmapLayoutType.Column,
  offset: 0,
  cellSize: undefined,
  cellPadding: 2,
  cellCornerRadius: 2,
  cursor: null,
  columnLabel: undefined,
  rowLabel: undefined,
}
