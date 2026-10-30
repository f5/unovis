/** Controls how the nearest datum is found when `snapToData` is enabled. */
export enum CrosshairSnapMode {
  /** Snap to the datum closest along the X axis only. */
  X = 'x',
  /** Snap to the datum closest to the mouse pointer in both X and Y (measured in pixel space). */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  XY = 'xy',
}

/** Circles whose Y positions are closer than this many radii overlap each other */
export const CROSSHAIR_CIRCLE_OVERLAP_RADII = 2

/** Circles positioned further than this many pixels outside the Y range are hidden */
export const CROSSHAIR_CIRCLE_Y_RANGE_TOLERANCE_PX = 1
