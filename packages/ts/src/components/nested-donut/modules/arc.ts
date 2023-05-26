import { Selection } from 'd3-selection'
import { Transition } from 'd3-transition'
import { interpolate } from 'd3-interpolate'
import { Arc } from 'd3-shape'

// Utils
import { getColor } from 'utils/color'
import { smartTransition } from 'utils/d3'

// Local Types
import { NestedDonutSegment } from '../types'

// Config
import { NestedDonutConfig } from '../config'

type AnimState = { x0: number; x1: number; y0: number; y1: number }
export interface ArcNode extends SVGElement {
  _animState?: AnimState;
}

export function createArc<Datum> (
  selection: Selection<SVGPathElement, NestedDonutSegment<Datum>, SVGGElement, unknown>,
  config: NestedDonutConfig<Datum>
): void {
  selection
    .style('fill', d => getColor(d, config.segmentColor) ?? d._state?.fill)
    .style('opacity', 0)
    .each((d, i, els) => {
      const arcNode: ArcNode = els[i]
      const angleCenter = (d.x0 + d.x1) / 2
      const angleHalfWidth = (d.x1 - d.x0) / 2
      arcNode._animState = {
        x0: angleCenter - angleHalfWidth,
        x1: angleCenter + angleHalfWidth,
        y0: d.y0,
        y1: d.y1,
      }
    })
}

export function updateArc<Datum> (
  selection: Selection<SVGPathElement, NestedDonutSegment<Datum>, SVGGElement, unknown>,
  config: NestedDonutConfig<Datum>,
  arcGen: Arc<any, AnimState>,
  duration: number
): void {
  selection
    .style('transition', `fill ${duration}ms`) // Animate color with CSS because we're using CSS-variables
    .style('fill', d => getColor(d, config.segmentColor) ?? d._state?.fill)

  if (duration) {
    const transition = smartTransition(selection, duration)
      .style('opacity', 1) as Transition<SVGPathElement, NestedDonutSegment<Datum>, SVGGElement, ArcNode>

    transition.attrTween('d', (d, i, els) => {
      const arcNode: ArcNode = els[i]
      const nextAnimState = { x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 }
      const datum = interpolate(arcNode._animState, nextAnimState)
      return (t: number): string => {
        arcNode._animState = datum(t)
        return arcGen(arcNode._animState)
      }
    })
  } else {
    selection.attr('d', arcGen)
      .style('opacity', 1)
  }
}

export function removeArc<Datum> (
  selection: Selection<SVGPathElement, NestedDonutSegment<Datum>, SVGGElement, unknown>,
  duration: number
): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
