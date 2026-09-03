import { PlotLabelLayout, PlotLabelLayoutInfo } from '@/types/plot-label'
import { TextAlign, VerticalAlign } from '@/types/text'
import { Rect } from '@/types/misc'
import { rectIntersect } from '@/utils/misc'
import { resolveRectsOverlap } from '@/utils/text-overlap'

/**
 * For a 90°/270° rotation, glyphs run perpendicular to the anchor — visual
 * width and height swap, and textAlign / verticalAlign act on the rotated axis.
 */
export function projectLabelRect (
  layout: PlotLabelLayout,
  width: number,
  height: number
): Rect {
  let x = layout.x
  let y = layout.y
  const deg = ((layout.rotation % 360) + 360) % 360
  const isQuarter = deg === 90 || deg === 270

  if (isQuarter) {
    const visualWidth = height
    const visualHeight = width

    switch (layout.textAlign) {
      case TextAlign.Center: y -= visualHeight / 2; break
      case TextAlign.Right: y -= visualHeight; break
    }
    switch (layout.verticalAlign) {
      case VerticalAlign.Middle: x -= visualWidth / 2; break
      case VerticalAlign.Bottom: x -= visualWidth; break
    }
    return { x, y, width: visualWidth, height: visualHeight }
  }

  switch (layout.textAlign) {
    case TextAlign.Center: x -= width / 2; break
    case TextAlign.Right: x -= width; break
  }

  switch (layout.verticalAlign) {
    case VerticalAlign.Middle: y -= height / 2; break
    case VerticalAlign.Bottom: y -= height; break
  }

  return { x, y, width, height }
}

export function rectInside (r: Rect, bounds: Rect): boolean {
  return r.x >= bounds.x &&
    r.y >= bounds.y &&
    r.x + r.width <= bounds.x + bounds.width &&
    r.y + r.height <= bounds.y + bounds.height
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

