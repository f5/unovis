export const DONUT_HALF_ANGLE_RANGES = Array.from({ length: 4 }, (_, i): [number, number] => {
  const offset = -Math.PI / 2 + i * Math.PI / 2
  return [offset, offset + Math.PI]
})

export const [
  DONUT_HALF_ANGLE_RANGE_TOP,
  DONUT_HALF_ANGLE_RANGE_RIGHT,
  DONUT_HALF_ANGLE_RANGE_BOTTOM,
  DONUT_HALF_ANGLE_RANGE_LEFT,
] = DONUT_HALF_ANGLE_RANGES

/** Default icon size as a fraction of the arc width, used when `iconSize` is not set */
export const DONUT_DEFAULT_ICON_SIZE_RATIO = 0.5

/** Maximum default icon size as a fraction of the donut radius, which keeps the icons of pie charts from getting too large */
export const DONUT_DEFAULT_MAX_ICON_SIZE_RATIO = 0.15

/** Maximum default icon size in pixels, which keeps the icons of large donuts from getting too large */
export const DONUT_DEFAULT_MAX_ICON_SIZE = 20

/** Space an icon needs around its center as a fraction of its size: half of the icon plus a margin to the segment's edges */
export const DONUT_ICON_CLEARANCE_RATIO = 0.6
