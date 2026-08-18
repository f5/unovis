// Types
import { Rect } from '@/types/misc'
import { Spacing } from '@/types/spacing'

// Utils
import { clamp } from '@/utils/data'

/** Converts a label's bounding box into the bleed required to fit it, i.e. the space needed outside
 * of a scale range. Used by the components that draw labels near the edges of the chart (e.g. Plotline, Plotband).
 */
export function labelBboxToBleed (
  labelBBox: Rect, // The label's bounding box, in the component's coordinate system.
  range: number[], // The pixel range of the scale the label is placed along.
  isVertical: boolean,
  maxRangeRatio = 1 / 3 //  Maximum bleed relative to the length of the scale range.
): Spacing {
  const labelStart = isVertical ? labelBBox.y : labelBBox.x
  const labelEnd = labelStart + (isVertical ? labelBBox.height : labelBBox.width)
  const rangeStart = Math.min(...range)
  const rangeEnd = Math.max(...range)
  const maxBleed = maxRangeRatio * (rangeEnd - rangeStart)

  // `rangeStart` is always the smallest pixel value, i.e. the top or the left edge of the chart
  const tolerance = 1.2
  const start = clamp(tolerance * (rangeStart - labelStart), 0, maxBleed)
  const end = clamp(tolerance * (labelEnd - rangeEnd), 0, maxBleed)

  return {
    top: isVertical ? start : 0,
    bottom: isVertical ? end : 0,
    left: isVertical ? 0 : start,
    right: isVertical ? 0 : end,
  }
}
