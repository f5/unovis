import { LabelOverflow, PlotLabelLayout, PlotLabelLayoutInfo } from 'types/plot-label'

export type Rect = { x: number; y: number; width: number; height: number }

function isRotatedQuarter (transform: string | undefined): boolean {
  if (!transform) return false
  const match = transform.match(/rotate\(\s*(-?\d+(?:\.\d+)?)/)
  if (!match) return false
  const deg = ((parseFloat(match[1]) % 360) + 360) % 360
  return deg === 90 || deg === 270
}

/**
 * For a 90°/270° rotation, glyphs run perpendicular to the anchor — visual
 * width and height swap, and `text-anchor` / `dominant-baseline` act on the
 * rotated axis. The rect math has to account for that.
 */
export function projectLabelRect (
  layout: PlotLabelLayout,
  width: number,
  height: number
): Rect {
  let x = layout.x
  let y = layout.y

  if (isRotatedQuarter(layout.transform)) {
    const visualWidth = height
    const visualHeight = width

    switch (layout.textAnchor) {
      case 'middle': y -= visualHeight / 2; break
      case 'start': y -= visualHeight; break
    }
    switch (layout.dominantBaseline) {
      case 'middle':
      case 'central':
        x -= visualWidth / 2
        break
      case 'text-before-edge':
      case 'hanging':
        x -= visualWidth
        break
    }
    return { x, y, width: visualWidth, height: visualHeight }
  }

  switch (layout.textAnchor) {
    case 'middle': x -= width / 2; break
    case 'end': x -= width; break
  }

  switch (layout.dominantBaseline) {
    case 'middle':
    case 'central':
      y -= height / 2
      break
    case 'text-after-edge':
    case 'alphabetic':
    case 'ideographic':
      y -= height
      break
  }

  return { x, y, width, height }
}

export function rectInside (r: Rect, bounds: Rect): boolean {
  return r.x >= bounds.x &&
    r.y >= bounds.y &&
    r.x + r.width <= bounds.x + bounds.width &&
    r.y + r.height <= bounds.y + bounds.height
}

export function totalOverlap (r: Rect, placed: Rect[]): number {
  let total = 0
  for (const p of placed) {
    const dx = Math.min(r.x + r.width, p.x + p.width) - Math.max(r.x, p.x)
    const dy = Math.min(r.y + r.height, p.y + p.height) - Math.max(r.y, p.y)
    if (dx > 0 && dy > 0) total += dx * dy
  }
  return total
}

export interface PlaceResult {
  layout: PlotLabelLayout;
  rect: Rect | null;
  visible: boolean;
}

export function tryPlaceLabel (
  info: PlotLabelLayoutInfo,
  baseRect: Rect | null,
  placed: Rect[],
  bounds: Rect
): PlaceResult {
  if (!baseRect || baseRect.width === 0 || baseRect.height === 0) {
    return { layout: info.computeLayout(info.preferredAnchor), rect: baseRect, visible: true }
  }

  const preferredLayout = info.computeLayout(info.preferredAnchor)
  const preferredRect = projectLabelRect(preferredLayout, baseRect.width, baseRect.height)
  const preferredOverlap = totalOverlap(preferredRect, placed)

  if (info.overflow === LabelOverflow.Stack) {
    return { layout: preferredLayout, rect: preferredRect, visible: true }
  }

  if (info.overflow === LabelOverflow.Hide) {
    if (preferredOverlap === 0 && rectInside(preferredRect, bounds)) {
      return { layout: preferredLayout, rect: preferredRect, visible: true }
    }
    return { layout: preferredLayout, rect: null, visible: false }
  }

  // Tie-break under 1px² so the earlier (closer to preferred) candidate wins
  // instead of jumping to one that's only fractionally less overlapped.
  const OVERLAP_EPSILON = 1
  let bestCandidate: { layout: PlotLabelLayout; rect: Rect; overlap: number } | undefined

  for (const anchor of info.candidates) {
    const layout = info.computeLayout(anchor)
    const rect = projectLabelRect(layout, baseRect.width, baseRect.height)

    const inBounds = rectInside(rect, bounds)
    const overlap = totalOverlap(rect, placed)

    if (inBounds && overlap === 0) {
      return { layout, rect, visible: true }
    }

    if (inBounds && (!bestCandidate || overlap < bestCandidate.overlap - OVERLAP_EPSILON)) {
      bestCandidate = { layout, rect, overlap }
    }
  }

  if (bestCandidate) {
    return { layout: bestCandidate.layout, rect: bestCandidate.rect, visible: true }
  }
  return { layout: preferredLayout, rect: preferredRect, visible: true }
}
