import { Selection } from 'd3-selection'
import { Transition } from 'd3-transition'
import { interpolate } from 'd3-interpolate'
import { Arc } from 'd3-shape'

// Types
import { GradientType, GradientUnits } from '@/types/gradient'

// Styles
import { GRADIENT_RADIAL_DEFAULT_STOPS } from '@/styles/gradients'

// Utils
import { getColor } from '@/utils/color'
import { getPattern, getFillPatternValue, UNOVIS_PATTERN_INDEX_ATTR } from '@/utils/pattern'
import { getGradient, getGradientFillValue } from '@/utils/gradient'
import { smartTransition } from '@/utils/d3'

// Local Types
import { NestedDonutArcAnimState, NestedDonutSegment } from '../types'

// Config
import { NestedDonutConfigInterface } from '../config'

export interface ArcNode extends SVGElement {
  _animState?: NestedDonutArcAnimState;
}

function getArcFill<Datum> (
  d: NestedDonutSegment<Datum>,
  config: NestedDonutConfigInterface<Datum>,
  color: string | null | undefined,
  element: SVGPathElement
): string | null {
  return getGradientFillValue(getGradient(d, config.gradient, d._index), color, element, {
    type: GradientType.Radial,
    units: GradientUnits.UserSpaceOnUse,
    stops: GRADIENT_RADIAL_DEFAULT_STOPS,
    space: { x: -d.y1, y: -d.y1, width: 2 * d.y1, height: 2 * d.y1, innerRadius: d.y0 },
  })
}

export function createArc<Datum> (
  selection: Selection<SVGPathElement, NestedDonutSegment<Datum>, SVGGElement, unknown>,
  config: NestedDonutConfigInterface<Datum>
): void {
  selection
    .attr(UNOVIS_PATTERN_INDEX_ATTR, d => d._index)
    .style('fill', (d, i, els) => getArcFill(d, config, getColor(d, config.segmentColor) ?? d._state?.fill, els[i]))
    .style('mask', d => getFillPatternValue(getPattern(d, config.segmentPattern, d._index)))
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
  config: NestedDonutConfigInterface<Datum>,
  arcGen: Arc<any, NestedDonutArcAnimState>,
  duration: number
): void {
  selection
    .style('transition', `fill ${duration}ms`) // Animate color with CSS because we're using CSS-variables
    .attr(UNOVIS_PATTERN_INDEX_ATTR, d => d._index)
    .style('fill', (d, i, els) => getArcFill(d, config, d._state.fill, els[i]))
    .style('fill-opacity', d => d._state.fillOpacity)
    .style('mask', d => getFillPatternValue(getPattern(d, config.segmentPattern, d._index)))

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
