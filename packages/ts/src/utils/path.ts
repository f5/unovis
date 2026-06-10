import { range, min, max } from 'd3-array'
import { line, curveCardinal, curveCardinalClosed } from 'd3-shape'
import { Path } from 'd3-path'

// Utils
import { clamp } from '@/utils/data'

export type RoundedRectPathOptions = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  tl: boolean;
  tr: boolean;
  bl: boolean;
  br: boolean;
}

/*
 * Generate SVG path for rectangle with rounded corners
 *
 * @param {Object} props - Configuration object
 * @param {Number} props.x - Rect top left X coordinate
 * @param {Number} props.y - Rect top left Y coordinate
 * @param {Number} props.w - Rect width
 * @param {Number} props.h - Rect height
 * @param {Bool} [props.tl=false] - Round top left corner
 * @param {Bool} [props.tr=false] - Round top right corner
 * @param {Bool} [props.bl=false] - Round bottom left corner
 * @param {Bool} [props.br=false] - Round bottom right corner
 * @param {Number} [props.r=0] - Corner Radius
 * @return {String} Path string for the `d` attribute
 */
export function roundedRectPath ({
  x,
  y,
  w,
  h,
  tl = false,
  tr = false,
  bl = false,
  br = false,
  r = 0,
}: RoundedRectPathOptions): string {
  let path
  path = `M${x + r},${y}h${w - 2 * r}`

  let roundedR = tr ? r : 0
  let angularR = tr ? 0 : r
  path += `a${roundedR},${roundedR} 0 0 1 ${roundedR},${roundedR}`
  path += `h${angularR}v${angularR}`
  path += `v${h - 2 * r}`

  roundedR = br ? r : 0
  angularR = br ? 0 : r
  path += `a${roundedR},${roundedR} 0 0 1 ${-roundedR},${roundedR}`
  path += `v${angularR}h${-angularR}`
  path += `h${2 * r - w}`

  roundedR = bl ? r : 0
  angularR = bl ? 0 : r
  path += `a${roundedR},${roundedR} 0 0 1 ${-roundedR},${-roundedR}`
  path += `h${-angularR}v${-angularR}`
  path += `v${2 * r - h}`

  roundedR = tl ? r : 0
  angularR = tl ? 0 : r
  path += `a${roundedR},${roundedR} 0 0 1 ${roundedR},${-roundedR}`
  path += `v${-angularR}h${angularR}`

  path += 'z'
  return path
}

export function polygon (size: number, n = 6, endAngle = 2 * Math.PI, open = false): string {
  const r = n === 4 ? Math.sqrt(0.5) * size : size / 3.6 * 2
  const deltaAngle = n === 4 ? Math.PI / 4 : 0 // rotate to 45 grads if shape is a rectangle
  const shiftedEndAngle = endAngle - deltaAngle

  const completion = (shiftedEndAngle < 0 ? endAngle : shiftedEndAngle) / (2 * Math.PI)
  const nSegments = Math.ceil(n * completion)

  const centerAngle = 1 / n * Math.PI * 2 //          /\
  const baseAngle = (Math.PI - centerAngle) / 2 //   /__\

  const data = range(nSegments + (shiftedEndAngle >= 0 ? 1 : 0))
    .map((d, i) => {
      const isLastSegment = i === nSegments || (nSegments === 1 && shiftedEndAngle < 0)
      let mult = isLastSegment ? ((completion * n) % 1 || 1) : 1 // Handle partial shape
      if (shiftedEndAngle < 0) {
        mult += 0.5
      }
      const angle = centerAngle * (i - 1 + mult)

      let radius
      if (isLastSegment) {
        const thirdAngle = Math.PI - baseAngle - centerAngle * mult
        radius = r * Math.sin(baseAngle) / Math.sin(thirdAngle) // Law of sines
      } else {
        radius = r
      }

      return {
        x: Math.sin(angle + deltaAngle) * radius,
        y: -Math.cos(angle + deltaAngle) * radius,
      }
    })

  if (n === 4) {
    const angle = centerAngle * (-1 + 0.5)
    const thirdAngle = Math.PI * 0.5
    const radius = r * Math.sin(baseAngle) / Math.sin(thirdAngle) // Law of sines
    data.unshift({
      x: Math.sin(angle + deltaAngle) * radius,
      y: -Math.cos(angle + deltaAngle) * radius,
    })
  }

  const path = line<any>()
    /* eslint-disable-next-line dot-notation */
    .x(d => d['x'])
    /* eslint-disable-next-line dot-notation */
    .y(d => d['y'])
    .curve((open ? curveCardinal : curveCardinalClosed).tension(0.95))

  return path(data)
}

export function circlePath (cx: number, cy: number, r: number): string {
  return `
    M ${cx} ${cy}
    m ${-r}, 0
    a ${r},${r} 0 1,1 ${r * 2},0
    a ${r},${r} 0 1,1 ${-r * 2},0`
}

export type ScoreRectPathOptions = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  score: number;
}

export function scoreRectPath ({ x, y, w, h, r = 0, score = 1 }: ScoreRectPathOptions): string {
  let path
  const side = 1 / 4
  const halfSide = side / 2
  let part = score

  //    8 1
  //    - -
  // 7 |   | 2
  // 6 |   | 3
  //    - -
  //    5 4

  // 1
  const hLength = min([w * 0.5 * (part / halfSide) + r, w * 0.5 - r])
  path = `M${x + w * 0.5},${y}h${hLength}`

  // 2, 3
  part = score - 1 / 8
  if (part > 0) {
    path += `a${r},${r} 0 0 1 ${r},${r}`
    const vLength = clamp(h * (part / side) - r, 0, h - 2 * r)
    path += `v${vLength}`
  }

  // 4, 5
  part = score - 3 / 8
  if (part > 0) {
    path += `a${r},${r} 0 0 1 ${-r},${r}`
    const hLength = clamp(r - w * (part / side), 2 * r - w, 0)
    path += `h${hLength}`
  }

  // 6, 7
  part = score - 5 / 8
  if (part > 0) {
    path += `a${r},${r} 0 0 1 ${-r},${-r}`
    const vLength = clamp(r - h * (part / side), 2 * r - h, 0)
    path += `v${vLength}`
  }

  // 8
  part = score - 7 / 8
  if (part > 0) {
    path += `a${r},${r} 0 0 1 ${r},${-r}`
    const hLength = max([w * 0.5 * (part / halfSide) - r, 0])
    path += `h${hLength}`
  }

  return path
}

/*
 * Replace L path command with arc with specified radius
 * @param {String} path - the path string
 * @param {number} r - radius in pixels
 * @returns {String} new path string
 */
export function convertLineToArc (path: Path | string, r: number): string {
  return path.toString().replace(/L(?<x>-?\d*\.?\d*),(?<y>-?\d+\.?\d*)/gm, (_, x, y) => `A ${r} ${r} 0 0 0 ${x} ${y}`)
}

/**
 * Generate an SVG path string for an arrow that follows a polyline path.
 * The arrow is composed of line segments between points and a triangular arrowhead at the end.
 *
 * @param opts - ArrowPolylinePathOptions object containing array of points and optional head dimensions.
 * @returns SVG path string for the arrow.
 */
export function arrowPolylinePath (
  points: [number, number][],
  arrowHeadLength = 8,
  arrowHeadWidth = 6,
  smoothing = 5
): string {
  if (points.length < 2) return ''

  // Calculate total path length
  let totalLength = 0
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[i + 1]
    totalLength += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  }

  // If the total length is zero or nearly zero, don't draw anything
  if (totalLength === 0) return ''

  // Let the default values be modifiable based on the line length
  let headLength = arrowHeadLength
  let headWidth = arrowHeadWidth

  // If the line is very short, scale down the arrow head dimensions
  const threshold = arrowHeadLength * 2
  if (totalLength < threshold) {
    const scale = totalLength / threshold
    headLength *= scale
    headWidth *= scale
  }

  // Ensure the arrow head length is never longer than the line itself
  headLength = Math.min(headLength / 2, totalLength)

  // Get the last two points for arrowhead calculation
  const [lastX, lastY] = points[points.length - 1]
  const [prevX, prevY] = points[points.length - 2]

  // Calculate direction vector for the last segment
  const dx = lastX - prevX
  const dy = lastY - prevY
  const segmentLength = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / segmentLength
  const uy = dy / segmentLength

  // Tail point of the arrow (where the arrowhead starts)
  const tailX = lastX - headLength * ux
  const tailY = lastY - headLength * uy

  // Perpendicular vector for arrowhead width calculation
  const perpX = -uy
  const perpY = ux

  // Calculate the two base points of the arrowhead triangle
  const leftX = tailX + (headWidth / 2) * perpX
  const leftY = tailY + (headWidth / 2) * perpY
  const rightX = tailX - (headWidth / 2) * perpX
  const rightY = tailY - (headWidth / 2) * perpY

  // Build the path
  const pathParts = []

  if (points.length === 2) {
    // For a single segment, create a curved path
    const [startX, startY] = points[0]

    // Adjust smoothing based on segment length
    const adjustedSmoothing = Math.min(smoothing, segmentLength / 3)

    // Calculate control points for a cubic Bézier curve with adjusted smoothing
    const cp1x = startX + ux * adjustedSmoothing
    const cp1y = startY + uy * adjustedSmoothing + perpY * adjustedSmoothing * 0.5

    const cp2x = tailX - ux * adjustedSmoothing
    const cp2y = tailY - uy * adjustedSmoothing + perpY * adjustedSmoothing * 0.5

    // Start path and add cubic Bézier curve
    pathParts.push(`M${startX},${startY}`)
    pathParts.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${lastX},${lastY}`)
  } else {
    // For multiple segments, use smooth Bézier corners with absolute smoothing
    pathParts.push(`M${points[0][0]},${points[0][1]}`)

    for (let i = 0; i < points.length - 2; i++) {
      const [x1, y1] = points[i]
      const [x2, y2] = points[i + 1]
      const [x3, y3] = points[i + 2]

      // Calculate vectors for the current and next segment
      const v1x = x2 - x1
      const v1y = y2 - y1
      const v2x = x3 - x2
      const v2y = y3 - y2

      // Calculate lengths of segments
      const len1 = Math.sqrt(v1x * v1x + v1y * v1y)
      const len2 = Math.sqrt(v2x * v2x + v2y * v2y)

      // Calculate unit vectors
      const u1x = v1x / len1
      const u1y = v1y / len1
      const u2x = v2x / len2
      const u2y = v2y / len2

      // Adjust smoothing based on the minimum segment length
      const minSegmentLength = Math.min(len1, len2)
      const adjustedSmoothing = Math.min(smoothing, minSegmentLength / 3)

      // Calculate the corner points and control points with adjusted smoothing
      const corner1x = x2 - u1x * adjustedSmoothing
      const corner1y = y2 - u1y * adjustedSmoothing
      const corner2x = x2 + u2x * adjustedSmoothing
      const corner2y = y2 + u2y * adjustedSmoothing

      // Add line to approach point
      pathParts.push(`L${corner1x},${corner1y}`)

      // Add cubic Bézier curve for the corner
      pathParts.push(`C${x2},${y2} ${x2},${y2} ${corner2x},${corner2y}`)
    }

    // Add the final line segment to the tail point
    pathParts.push(`L${lastX},${lastY}`)
  }

  // Add the arrowhead
  pathParts.push(`M${leftX},${leftY} L${lastX},${lastY} L${rightX},${rightY}`)

  return pathParts.join(' ')
}
