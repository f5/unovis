/** Controls how the nearest datum is found when `snapToData` is enabled. */
export enum CrosshairSnapMode {
  /** Snap to the datum closest along the X axis only. */
  X = 'x',
  /** Snap to the datum closest to the mouse pointer in both X and Y (measured in pixel space). */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  XY = 'xy',
}
