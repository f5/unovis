/** Tolerance for degenerate geometry (zero-width or zero-length bars) */
export const CIRCULAR_BAR_EPSILON = 1e-9

/** Default inner radius as a fraction of the chart radius, used when `innerRadius` is not set */
export const CIRCULAR_BAR_DEFAULT_INNER_RADIUS_RATIO = 0.26

/** Default outer corner radius as a fraction of the chart radius, used when `cornerRadius` is not set */
export const CIRCULAR_BAR_DEFAULT_CORNER_RADIUS_RATIO = 0.12

/** Minimum default inner corner radius as a fraction of the largest corner radius that fits into the outer end of a bar,
 * used when `innerCornerRadius` is not set. When the tip touching `innerRadius` would be sharper, the tip starts beyond it
 */
export const CIRCULAR_BAR_DEFAULT_TIP_ROUNDING_RATIO = 0.2

/** Default gap between bars as a fraction of the chart radius, used when `barPadding` is not set */
export const CIRCULAR_BAR_DEFAULT_PADDING_RATIO = 0.03

/** Default icon size as a fraction of the chart radius, used when `iconSize` is not set */
export const CIRCULAR_BAR_DEFAULT_ICON_SIZE_RATIO = 0.08

/** Space an icon needs around its center as a fraction of its size: half of the icon plus a margin to the bar's edges */
export const CIRCULAR_BAR_ICON_CLEARANCE_RATIO = 1.1
