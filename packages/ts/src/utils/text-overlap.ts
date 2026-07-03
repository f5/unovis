import { select, Selection, BaseType } from 'd3-selection'

// Types
import { Rect } from '@/types/misc'

// Utils
import { rectIntersect } from '@/utils/misc'

export interface ResolveRectsOverlapOptions {
  /** Padding for the intersection test, forwarded to `rectIntersect`.
   * A negative value expands the rects (hides more eagerly / enforces a minimum gap),
   * a positive value shrinks them (rects must overlap more before being considered colliding). Default: `0` */
  tolerance?: number;
  /** Optional per-rect priority, aligned to `rects`. When two rects collide, the one with the higher priority
   * stays visible. Ties (or when omitted) are resolved in favour of the rect that comes first in sweep order
   * (the left-most / top-most one). Default: `undefined` */
  priorities?: number[];
}

/**
 * Resolves overlaps among a set of axis-aligned rectangles using a sort-and-sweep
 * ("sweep and prune") algorithm. Works for text distributed along one axis (axis tick
 * labels, heatmap row / column labels) as well as text distributed across a 2D grid.
 *
 * The sweep axis is chosen automatically as the axis along which the rects are more
 * spread out, keeping the active set small in every layout. Overlapping cascades are
 * resolved in a single pass: it runs in `O(n log n)` for spatially separated rects and
 * only degrades towards `O(n²)` when many rects genuinely share the sweep-axis interval.
 *
 * @returns A boolean array aligned to `rects`: `true` = keep visible, `false` = hide.
 */
export function resolveRectsOverlap (rects: Rect[], options: ResolveRectsOverlapOptions = {}): boolean[] {
  const { tolerance = 0, priorities } = options
  const n = rects.length
  const visible = new Array<boolean>(n).fill(true)
  if (n < 2) return visible

  // Pick the sweep axis as the one with the larger spread of rect centers
  let minCx = Infinity; let maxCx = -Infinity
  let minCy = Infinity; let maxCy = -Infinity
  for (const r of rects) {
    const cx = r.x + r.width / 2
    const cy = r.y + r.height / 2
    if (cx < minCx) minCx = cx
    if (cx > maxCx) maxCx = cx
    if (cy < minCy) minCy = cy
    if (cy > maxCy) maxCy = cy
  }
  const sweepX = (maxCx - minCx) >= (maxCy - minCy)
  const nearStart = (r: Rect): number => sweepX ? r.x : r.y
  const farEnd = (r: Rect): number => sweepX ? r.x + r.width : r.y + r.height
  const priority = (i: number): number => priorities?.[i] ?? 0

  // Process rects in order of their near edge along the sweep axis
  const order = rects.map((_, i) => i).sort((a, b) => nearStart(rects[a]) - nearStart(rects[b]))

  // `active` holds indices of currently-visible rects whose sweep-axis interval may still
  // overlap upcoming rects. `rectIntersect` maps `tolerance` to a `3 * tolerance` shift of
  // the separation boundary, so the same factor is used here to prune conservatively.
  const active: number[] = []
  for (const i of order) {
    const iNear = nearStart(rects[i])
    for (let k = active.length - 1; k >= 0; k -= 1) {
      if (farEnd(rects[active[k]]) - 3 * tolerance < iNear) active.splice(k, 1)
    }

    // Decide `i`'s fate against every active rect it overlaps before mutating anything,
    // so the outcome never depends on iteration order.
    const overlapping: number[] = []
    let blocked = false
    for (const j of active) {
      if (!rectIntersect(rects[i], rects[j], tolerance)) continue
      if (priority(j) >= priority(i)) { blocked = true; break }
      overlapping.push(j)
    }

    if (blocked) {
      visible[i] = false
    } else {
      // `i` strictly outranks every rect it overlaps — hide them and keep `i`
      for (const j of overlapping) {
        visible[j] = false
        active.splice(active.indexOf(j), 1)
      }
      active.push(i)
    }
  }

  return visible
}

/**
 * Hides overlapping label elements in a d3 selection by measuring their on-screen
 * bounding boxes and resolving collisions with {@link resolveRectsOverlap}. Visible
 * labels get `opacity: 1`, hidden ones `opacity: 0`. Call inside a `requestAnimationFrame`
 * to avoid forcing a synchronous reflow.
 */
export function hideOverlappingLabels<El extends SVGGraphicsElement, D, PEl extends BaseType, PD> (
  selection: Selection<El, D, PEl, PD>,
  options: ResolveRectsOverlapOptions = {}
): void {
  const nodes = selection.nodes()
  if (nodes.length < 2) {
    selection.style('opacity', null)
    return
  }

  const rects: Rect[] = nodes.map(node => {
    const { x, y, width, height } = node.getBoundingClientRect()
    return { x, y, width, height }
  })
  const visible = resolveRectsOverlap(rects, options)
  nodes.forEach((node, i) => select(node).style('opacity', visible[i] ? 1 : 0))
}
