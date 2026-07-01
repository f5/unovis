export enum HeatmapLayoutType {
  Column = 'column',
  Row = 'row',
}

/** Internal per-cell record computed during rendering. */
export interface HeatmapCellDatum<Datum> {
  /** Original datum. */
  datum: Datum;
  /** Original datum index as in the provided `data` array. */
  index: number;
  /** Position of the datum within the linear sequence (datum index + `offset`). */
  gridIndex: number;
  /** Row index in the grid. */
  row: number;
  /** Column index in the grid. */
  column: number;
  /** Resolved numeric value. `null`/`undefined` renders an empty cell. */
  value: number | null | undefined;
  /** Cell top-left X coordinate in pixels. */
  x: number;
  /** Cell top-left Y coordinate in pixels. */
  y: number;
  /** Cell width in pixels. */
  width: number;
  /** Cell height in pixels. */
  height: number;
}
