import { polygon, circlePath } from 'utils/path'
import { Selection } from 'd3-selection'

// Utils
import { getNumber } from 'utils/data'
import { estimateStringPixelLength } from 'utils/text'
import { rectIntersect } from 'utils/misc'

// Types
import { NumericAccessor } from 'types/accessor'
import { Rect } from 'types/misc'

// Styles
import * as s from './style'

// Local Types
import { TopoJSONMapPointShape } from './types'

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

// Extend SVGTextElement to track label visibility for area labels
interface LabelSVGTextElement extends SVGTextElement {
  _labelVisible?: boolean;
}

export function collideAreaLabels (
  selection: Selection<SVGTextElement, any, SVGGElement, unknown>
): void {
  if (selection.size() === 0) return

  const labelNodes = selection.nodes() as LabelSVGTextElement[]
  const labelData = selection.data()

  // Reset all labels to visible
  labelNodes.forEach((node) => {
    node._labelVisible = true
  })

  // Get actual font size
  let actualFontSize = 12
  if (labelNodes.length > 0) {
    const computedStyle = getComputedStyle(labelNodes[0])
    const fontSize = computedStyle.fontSize
    if (fontSize) actualFontSize = parseFloat(fontSize)
  }

  const getBBox = (labelData: any): Rect => {
    const [x, y] = labelData.centroid
    const labelText = labelData.labelText || ''
    const width = estimateStringPixelLength(labelText, actualFontSize, 0.6)
    const height = actualFontSize

    return {
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
    }
  }

  labelNodes.forEach((node1, i) => {
    const data1 = labelData[i]
    if (!node1._labelVisible) return

    const label1BoundingRect = getBBox(data1)

    for (let j = 0; j < labelNodes.length; j++) {
      if (i === j) continue

      const node2 = labelNodes[j]
      const data2 = labelData[j]

      if (!node2._labelVisible) continue

      const label2BoundingRect = getBBox(data2)
      const intersect = rectIntersect(label1BoundingRect, label2BoundingRect, 0.25)

      if (intersect) {
        if (data1.area >= data2.area) {
          node2._labelVisible = false
        } else {
          node1._labelVisible = false
          break
        }
      }
    }
  })

  selection.style('opacity', (d, i) => labelNodes[i]._labelVisible ? 1 : 0)
}
