import { Selection } from 'd3-selection'
import { Transition } from 'd3-transition'
import { interpolate } from 'd3-interpolate'
import { Arc } from 'd3-shape'

// Utils
import { getColor } from '@/utils/color'
import { smartTransition } from '@/utils/d3'

// Local Types
import { DonutArcDatum, DonutArcAnimState } from '../types'

// Config
import { DonutConfigInterface } from '../config'

export interface ArcNode extends SVGElement {
  _animState?: DonutArcAnimState;
}

export function createArc<Datum> (
  selection: Selection<SVGPathElement, DonutArcDatum<Datum>, SVGGElement, unknown>,
  config: DonutConfigInterface<Datum>
): void {
  selection
    .style('fill', d => getColor(d.data, config.color, d.index))
    .style('opacity', 0)
    .each((d, i, els) => {
      const arcNode: ArcNode = els[i]
      const angleCenter = (d.startAngle + d.endAngle) / 2
      const angleHalfWidth = (d.endAngle - d.startAngle) / 2
      arcNode._animState = {
        startAngle: angleCenter - angleHalfWidth,
        endAngle: angleCenter + angleHalfWidth,
        innerRadius: d.innerRadius,
        outerRadius: d.outerRadius,
        padAngle: d.padAngle,
      }
    })
}

export function updateArc<Datum> (
  selection: Selection<SVGPathElement, DonutArcDatum<Datum>, SVGGElement, unknown>,
  config: DonutConfigInterface<Datum>,
  arcGen: Arc<any, DonutArcAnimState>,
  duration: number
): void {
  selection
    .style('transition', `fill ${duration}ms`) // Animate color with CSS because we're using CSS-variables
    .style('fill', d => getColor(d.data, config.color, d.index))

  const setOpacity = (d: DonutArcDatum<Datum>): number => (config.showEmptySegments || d.value) ? 1 : 0
  if (duration) {
    const transition = smartTransition(selection, duration)
      .style('opacity', setOpacity) as Transition<SVGPathElement, DonutArcDatum<Datum>, SVGGElement, unknown>

    transition.attrTween('d', (d, i, els) => {
      const arcNode: ArcNode = els[i]
      const nextAnimState: DonutArcAnimState = {
        startAngle: d.startAngle,
        endAngle: d.endAngle,
        innerRadius: d.innerRadius,
        outerRadius: d.outerRadius,
        padAngle: d.padAngle,
      }
      const datum = interpolate(arcNode._animState, nextAnimState)

      return (t: number): string => {
        arcNode._animState = datum(t)
        return arcGen(arcNode._animState as DonutArcDatum<Datum>)
      }
    })
  } else {
    selection
      .attr('d', arcGen)
      .style('opacity', setOpacity)
  }
}

export function removeArc<Datum> (
  selection: Selection<SVGPathElement, DonutArcDatum<Datum>, SVGGElement, unknown>,
  duration: number
): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
