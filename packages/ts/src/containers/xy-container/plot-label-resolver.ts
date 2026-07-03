import { LabelOverflow, PlotLabelLayout, PlotLabelLayoutInfo } from 'types/plot-label'
import { Rect } from 'types/misc'
import { rectIntersect } from 'utils/misc'
import { resolveRectsOverlap } from 'utils/text-overlap'

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

  if (info.overflow === LabelOverflow.Stack) {
    return { layout: preferredLayout, rect: preferredRect, visible: true }
  }

  // `LabelOverflow.Hide` is not handled here — those labels are collision-resolved
  // together as a batch by `resolveHideOverflow` (see below).

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

/**
 * Resolves visibility for `LabelOverflow.Hide` labels as a batch.
 *
 * Hide labels never move: they either stay at their preferred position or disappear.
 * A candidate is hidden when it is out of bounds, clashes with a `fixed` rect (a Stack
 * or already auto-positioned label — those take precedence and never move), or loses a
 * mutual collision to a higher-priority Hide candidate. Mutual collisions are delegated
 * to the shared `resolveRectsOverlap` sweep-and-prune util; earlier candidates win ties.
 *
 * @param candidateRects Preferred-position rects of the Hide labels (`null` = unmeasured).
 * @param fixed          Rects of the already-placed, non-hideable labels.
 * @param bounds         Container bounds; candidates outside are hidden.
 * @returns A boolean array aligned to `candidateRects`: `true` = keep visible.
 */
export function resolveHideOverflow (candidateRects: (Rect | null)[], fixed: Rect[], bounds: Rect): boolean[] {
  const visible = candidateRects.map(() => true)

  // Drop candidates that can't be shown regardless of their peers: unmeasured labels
  // stay visible (nothing to test), out-of-bounds or fixed-clashing ones are hidden.
  const participants: number[] = []
  candidateRects.forEach((rect, i) => {
    if (!rect) return
    if (!rectInside(rect, bounds) || fixed.some(f => rectIntersect(rect, f))) {
      visible[i] = false
      return
    }
    participants.push(i)
  })

  // Resolve the remaining candidates against each other with the shared util.
  const rects = participants.map(i => candidateRects[i] as Rect)
  const priorities = participants.map((_, k) => participants.length - k) // earlier → higher priority
  const kept = resolveRectsOverlap(rects, { priorities })
  participants.forEach((i, k) => { if (!kept[k]) visible[i] = false })

  return visible
}
