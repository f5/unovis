import { Selection } from 'd3-selection'
import { Transition } from 'd3-transition'
import { interpolate } from 'd3-interpolate'
import { Arc } from 'd3-shape'

// Utils
import { getColor } from '@/utils/color'
import { smartTransition } from '@/utils/d3'
import { getGradient, getGradientFillValue } from '@/utils/gradient'

// Types
import { GradientType, GradientUnits } from '@/types/gradient'

// Styles
import { GRADIENT_RADIAL_DEFAULT_STOPS } from '@/styles/gradients'

// Local Types
import { RadialBarArcDatum, RadialBarArcAnimState } from '../types'

// Config
import { RadialBarConfigInterface } from '../config'

export interface BarNode extends SVGElement {
  _animState?: RadialBarArcAnimState;
}

function getBarFill<Datum> (d: RadialBarArcDatum<Datum>, config: RadialBarConfigInterface<Datum>, context: Element): string | null {
  return getGradientFillValue(getGradient(d.data, config.gradient, d.index), getColor(d.data, config.color, d.index), context, {
    type: GradientType.Radial,
    units: GradientUnits.UserSpaceOnUse,
    stops: GRADIENT_RADIAL_DEFAULT_STOPS,
    space: { x: -d.outerRadius, y: -d.outerRadius, width: 2 * d.outerRadius, height: 2 * d.outerRadius, innerRadius: d.innerRadius },
  })
}

export function createBar<Datum> (
  selection: Selection<SVGPathElement, RadialBarArcDatum<Datum>, SVGGElement, unknown>,
  config: RadialBarConfigInterface<Datum>
): void {
  selection
    .style('fill', (d, i, els) => getBarFill(d, config, els[i]))
    .style('opacity', 0)
    .each((d, i, els) => {
      const arcNode: BarNode = els[i]
      arcNode._animState = {
        startAngle: d.startAngle,
        endAngle: d.startAngle,
        innerRadius: d.innerRadius,
        outerRadius: d.outerRadius,
        padAngle: d.padAngle,
      }
    })
}

export function updateBar<Datum> (
  selection: Selection<SVGPathElement, RadialBarArcDatum<Datum>, SVGGElement, unknown>,
  config: RadialBarConfigInterface<Datum>,
  arcGen: Arc<any, RadialBarArcAnimState>,
  duration: number
): void {
  selection
    .style('transition', `fill ${duration}ms`) // Animate color with CSS because we're using CSS-variables
    .style('fill', (d, i, els) => getBarFill(d, config, els[i]))

  const setOpacity = (d: RadialBarArcDatum<Datum>): number => (d.value || d.endAngle !== d.startAngle) ? 1 : 0
  if (duration) {
    const transition = smartTransition(selection, duration)
      .style('opacity', setOpacity) as Transition<SVGPathElement, RadialBarArcDatum<Datum>, SVGGElement, unknown>

    transition.attrTween('d', (d, i, els) => {
      const arcNode: BarNode = els[i]
      const nextAnimState: RadialBarArcAnimState = {
        startAngle: d.startAngle,
        endAngle: d.endAngle,
        innerRadius: d.innerRadius,
        outerRadius: d.outerRadius,
        padAngle: d.padAngle,
      }
      const datum = interpolate(arcNode._animState, nextAnimState)

      return (t: number): string => {
        arcNode._animState = datum(t)
        return arcGen(arcNode._animState as RadialBarArcAnimState)
      }
    })
  } else {
    selection
      .attr('d', arcGen)
      .style('opacity', setOpacity)
  }
}

export function removeBar<Datum> (
  selection: Selection<SVGPathElement, RadialBarArcDatum<Datum>, SVGGElement, unknown>,
  duration: number
): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
