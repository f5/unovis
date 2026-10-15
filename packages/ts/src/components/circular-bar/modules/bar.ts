import { Selection } from 'd3-selection'
import { Transition } from 'd3-transition'
import { interpolate } from 'd3-interpolate'

// Utils
import { getColor } from '@/utils/color'
import { smartTransition } from '@/utils/d3'

// Local Types
import { CircularBarArcDatum, CircularBarArcAnimState } from '../types'

// Config
import { CircularBarConfigInterface } from '../config'

export interface BarNode extends SVGElement {
  _animState?: CircularBarArcAnimState;
}

export type CircularBarPathGenerator = (state: CircularBarArcAnimState) => string

function getAnimState<Datum> (d: CircularBarArcDatum<Datum>, outerRadius = d.outerRadius): CircularBarArcAnimState {
  return {
    startAngle: d.startAngle,
    endAngle: d.endAngle,
    innerRadius: d.innerRadius,
    outerRadius,
  }
}

export function createBar<Datum> (
  selection: Selection<SVGPathElement, CircularBarArcDatum<Datum>, SVGGElement, unknown>,
  config: CircularBarConfigInterface<Datum>
): void {
  selection
    .style('fill', d => getColor(d.data, config.color, d.index))
    .style('opacity', 0)
    .each((d, i, els) => {
      const arcNode: BarNode = els[i]
      // Bars grow from their inner edge when they enter
      arcNode._animState = getAnimState(d, d.baseRadius)
    })
}

export function updateBar<Datum> (
  selection: Selection<SVGPathElement, CircularBarArcDatum<Datum>, SVGGElement, unknown>,
  config: CircularBarConfigInterface<Datum>,
  pathGen: CircularBarPathGenerator,
  duration: number
): void {
  selection
    .style('transition', `fill ${duration}ms`) // Animate color with CSS because we're using CSS-variables
    .style('fill', d => getColor(d.data, config.color, d.index))

  const setOpacity = (d: CircularBarArcDatum<Datum>): number => d.value === null ? 0 : 1
  if (duration) {
    const transition = smartTransition(selection, duration)
      .style('opacity', setOpacity) as Transition<SVGPathElement, CircularBarArcDatum<Datum>, SVGGElement, unknown>

    // The path is tweened from the interpolated geometry rather than as a string, because the arc flags in it
    // must stay `0` or `1` and the number of arc commands can change between the tip and the inner-arc shapes
    transition.attrTween('d', (d, i, els) => {
      const arcNode: BarNode = els[i]
      const datum = interpolate(arcNode._animState, getAnimState(d))

      return (t: number): string => {
        arcNode._animState = datum(t)
        return pathGen(arcNode._animState as CircularBarArcAnimState)
      }
    })
  } else {
    // Stop a running transition, otherwise it would keep animating the shape to its previous target
    selection.interrupt()
    selection
      .each((d, i, els) => {
        const arcNode: BarNode = els[i]
        arcNode._animState = getAnimState(d)
      })
      .attr('d', d => pathGen(d))
      .style('opacity', setOpacity)
  }
}

/** Background bars share the geometry of the bars, but always reach the outer radius of the chart */
export function createBackground<Datum> (
  selection: Selection<SVGPathElement, CircularBarArcDatum<Datum>, SVGGElement, unknown>,
  chartRadius: number
): void {
  selection
    .style('opacity', 0)
    .each((d, i, els) => {
      const arcNode: BarNode = els[i]
      arcNode._animState = getAnimState(d, chartRadius)
    })
}

export function updateBackground<Datum> (
  selection: Selection<SVGPathElement, CircularBarArcDatum<Datum>, SVGGElement, unknown>,
  chartRadius: number,
  pathGen: CircularBarPathGenerator,
  duration: number
): void {
  // See `updateBar` for why the path is tweened from the geometry instead of as a string
  if (duration) {
    const transition = smartTransition(selection, duration)
      .style('opacity', 1) as Transition<SVGPathElement, CircularBarArcDatum<Datum>, SVGGElement, unknown>

    transition.attrTween('d', (d, i, els) => {
      const arcNode: BarNode = els[i]
      const datum = interpolate(arcNode._animState, getAnimState(d, chartRadius))

      return (t: number): string => {
        arcNode._animState = datum(t)
        return pathGen(arcNode._animState as CircularBarArcAnimState)
      }
    })
  } else {
    // Stop a running transition, otherwise it would keep animating the shape to its previous target
    selection.interrupt()
    selection
      .each((d, i, els) => {
        const arcNode: BarNode = els[i]
        arcNode._animState = getAnimState(d, chartRadius)
      })
      .attr('d', d => pathGen(getAnimState(d, chartRadius)))
      .style('opacity', 1)
  }
}

export function removeBar<Datum> (
  selection: Selection<SVGPathElement, CircularBarArcDatum<Datum>, SVGGElement, unknown>,
  duration: number
): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
