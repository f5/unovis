/** Zoom exponent per unit of `WheelEvent.deltaY`, by `deltaMode` (pixels, lines, pages). The same values as in d3-zoom */
export const ZOOM_WHEEL_DELTA_MULTIPLIERS = [0.002, 0.05, 1]

/** Trackpad pinch gestures come as `wheel` events with `ctrlKey` and small deltas, so we amplify them */
export const ZOOM_PINCH_WHEEL_MULTIPLIER = 10

/** Maximum zoom exponent of a single `wheel` event (`2 ** 0.5` ≈ 1.41x), so a Ctrl + mouse wheel notch doesn't jump too far */
export const ZOOM_WHEEL_MAX_EXPONENT = 0.5

/** Pixels per `WheelEvent.deltaX` unit when panning, by `deltaMode` (pixels, lines, pages) */
export const ZOOM_WHEEL_PAN_MULTIPLIERS = [1, 16, 400]

/** Distance in pixels a mouse has to move with the button pressed before a drag starts panning */
export const ZOOM_DRAG_THRESHOLD_PX = 3

/** By default, the X domain can't be narrower than this number of steps between neighboring data points */
export const ZOOM_AUTO_MIN_SPAN_STEPS = 2

/** Zoom factor of the `+` and `-` keys */
export const ZOOM_KEYBOARD_FACTOR = 1.5
