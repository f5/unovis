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

/** The circle of the series highlighted with the keyboard is this many times larger */
export const CROSSHAIR_ACTIVE_CIRCLE_RADIUS_SCALE = 1.5

/** `PageUp` and `PageDown` move the Crosshair by this fraction of the navigable data points */
export const CROSSHAIR_KEYBOARD_PAGE_FRACTION = 0.1

/** When keyboard navigation pans a zoomed chart, the active data point is kept this fraction of the domain away from the edge */
export const CROSSHAIR_KEYBOARD_PAN_PADDING = 0.05
