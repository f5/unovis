import { polygon, circlePath } from 'utils/path'
import { select, Selection } from 'd3-selection'
import { GeoProjection } from 'd3-geo'

// Utils
import { getNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { estimateTextSize } from 'utils/text'
import { rectIntersect } from 'utils/misc'

// Types
import { NumericAccessor } from 'types/accessor'
import { Rect } from 'types/misc'

// Styles
import * as s from './style'

// Local Types
import { TopoJSONMapPointShape } from './types'
interface LabelSVGGElement extends SVGGElement {
  labelVisible?: boolean;
}

const BOTTOM_LABEL_TOP_MARGIN = 10

export function getLonLat<Datum> (d: Datum, pointLongitude: NumericAccessor<Datum>, pointLatitude: NumericAccessor<Datum>): [number, number] {
  const lat = getNumber(d, pointLatitude)
  const lon = getNumber(d, pointLongitude)
  return [lon, lat]
}

export function arc (source?: number[], target?: number[], curvature?: number): string {
  if (!target || !source) return 'M0,0,l0,0z'
  const d = 3
  const angleOffset = curvature || 0
  const s = { x: source[0], y: source[1] }
  const t = { x: target[0], y: target[1] }
  const ds = { x: (t.x - s.x) / d, y: (t.y - s.y) / d }
  const dt = { x: (s.x - t.x) / d, y: (s.y - t.y) / d }
  let angle = 0.16667 * Math.PI * (1 + angleOffset)
  if (s.x < t.x) angle = -angle
  const cs = Math.cos(angle)
  const ss = Math.sin(angle)
  const ct = Math.cos(-angle)
  const st = Math.sin(-angle)
  const dds = { x: (cs * ds.x) - (ss * ds.y), y: (ss * ds.x) + (cs * ds.y) }
  const ddt = { x: (ct * dt.x) - (st * dt.y), y: (st * dt.x) + (ct * dt.y) }
  return `M${s.x},${s.y} C${s.x + dds.x},${s.y + dds.y} ${t.x + ddt.x},${t.y + ddt.y} ${t.x},${t.y}`
}

export function getPointPathData ({ x, y }: { x: number; y: number }, radius: number, shape: TopoJSONMapPointShape): string {
  switch (shape) {
    case TopoJSONMapPointShape.Triangle:
      return polygon(radius * 2, 3)
    case TopoJSONMapPointShape.Square:
      return polygon(radius * 2, 4)
    case TopoJSONMapPointShape.Circle:
    case TopoJSONMapPointShape.Ring:
    default:
      return circlePath(x, y, radius)
  }
}

function getCSSVariableValueInPixels (cssVariable: string, element: SVGGElement | null): number {
  if (!element) return 0

  const computedValue = getComputedStyle(element).getPropertyValue(cssVariable)
  if (!computedValue) return 0

  // Parse the value and convert to pixels if needed
  const trimmedValue = computedValue.trim()

  // Handle pixel values
  if (trimmedValue.endsWith('px')) {
    return parseFloat(trimmedValue)
  }

  // Handle em/rem values by converting to pixels
  if (trimmedValue.endsWith('em') || trimmedValue.endsWith('rem')) {
    const numericValue = parseFloat(trimmedValue)
    const fontSize = parseFloat(getComputedStyle(element).fontSize)
    return numericValue * fontSize
  }

  // Handle unitless or already numeric values
  const numericValue = parseFloat(trimmedValue)
  return isNaN(numericValue) ? 0 : numericValue
}

export function collideLabels (
  selection: Selection<SVGGElement, unknown, SVGGElement, unknown>,
  projection: GeoProjection,
  pointRadius: NumericAccessor<unknown>,
  pointLongitude: NumericAccessor<unknown>,
  pointLatitude: NumericAccessor<unknown>,
  currentZoomLevel: number
): void {
  selection.each((datum1: unknown, i: number, elements: ArrayLike<LabelSVGGElement>) => {
    const group1LabelElement = elements[i]
    const group1 = select(group1LabelElement)
    const label1: Selection<SVGTextElement, any, SVGElement, any> = group1.select(`.${s.pointLabel}`)
    group1LabelElement.labelVisible = true

    // Calculate bounding rect of point's bottom label
    const bottomLabelFontSizePx = getCSSVariableValueInPixels('--vis-map-point-label-font-size', selection.node())
    const pos1 = projection(getLonLat(datum1, pointLongitude, pointLatitude))
    if (!pos1) return

    const p1Pos = { x: pos1[0], y: pos1[1] }
    const radius1 = getNumber(datum1, pointRadius) / currentZoomLevel
    const label1Size = estimateTextSize(label1, bottomLabelFontSizePx, 0.32, true, 0.6)
    const label1BoundingRect: Rect = {
      x: p1Pos.x - label1Size.width / 2,
      y: p1Pos.y - label1Size.height / 2 + radius1 + BOTTOM_LABEL_TOP_MARGIN,
      width: label1Size.width,
      height: label1Size.height,
    }

    for (let j = 0; j < elements.length; j += 1) {
      if (i === j) continue
      const group2LabelElement = elements[j]
      const group2 = select(group2LabelElement)
      const label2: Selection<SVGTextElement, any, SVGElement, any> = group2.select(`.${s.pointLabel}`)
      const datum2 = group2.datum() as unknown

      // Calculate bounding rect of the second point's circle
      const pos2 = projection(getLonLat(datum2, pointLongitude, pointLatitude))
      if (!pos2) continue

      const p2Pos = { x: pos2[0], y: pos2[1] }
      const radius2 = getNumber(datum2, pointRadius) / currentZoomLevel
      const point2BoundingRect = {
        x: p2Pos.x - radius2,
        y: p2Pos.y - radius2,
        width: 2 * radius2,
        height: 2 * radius2,
      }

      let intersect = rectIntersect(label1BoundingRect, point2BoundingRect)

      // If there's not intersection, check a collision with the second point's label
      const label2Visible = group2LabelElement.labelVisible
      if (!intersect && label2Visible) {
        const label2Size = estimateTextSize(label2, bottomLabelFontSizePx, 0.32, true, 0.6)
        intersect = rectIntersect(label1BoundingRect, {
          x: p2Pos.x - label2Size.width / 2,
          y: p2Pos.y + radius2 + BOTTOM_LABEL_TOP_MARGIN - label2Size.height / 2,
          width: label2Size.width,
          height: label2Size.height,
        })
      }

      if (intersect) {
        group1LabelElement.labelVisible = false
        break
      }
    }

    smartTransition(label1, 0).attr('opacity', group1LabelElement.labelVisible ? 1 : 0)
  })
}
