// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection } from 'd3-selection'
import { interpolate } from 'd3-interpolate'
import { Arc } from 'd3-shape'

// Utils
import { getColor } from 'utils/color'
import { smartTransition } from 'utils/d3'

// Types
import { DonutArcDatum, DonutArcAnimState } from 'types/donut'

// Config
import { DonutConfig } from '../config'

export interface ArcNode extends SVGElement {
  _animState?: DonutArcAnimState;
}

export function createArc<Datum> (
  selection: Selection<SVGPathElement, DonutArcDatum<Datum>, SVGGElement, DonutArcDatum<Datum>[]>,
  config: DonutConfig<Datum>
): void {
  selection
    .style('fill', (d, i) => getColor(d.data, config.color, i))
    .style('stroke', (d, i) => getColor(d.data, config.color, i))
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
      }
    })
}

export function updateArc<Datum> (
  selection: Selection<SVGElement, DonutArcDatum<Datum>, SVGGElement, DonutArcDatum<Datum>[]>,
  config: DonutConfig<Datum>,
  arcGen: Arc<any, DonutArcAnimState>,
  duration: number
): void {
  selection
    .style('transition', `fill ${duration}ms`) // Animate color with CSS because we're using CSS-variables
    .style('fill', (d, i) => getColor(d.data, config.color, i))
    .style('stroke', (d, i) => getColor(d.data, config.color, i))

  if (duration) {
    smartTransition(selection, duration)
      .style('opacity', 1)
      .attrTween('d', (d, i, els) => {
        const arcNode: ArcNode = els[i]
        const nextAnimState: DonutArcAnimState = { startAngle: d.startAngle, endAngle: d.endAngle, innerRadius: d.innerRadius, outerRadius: d.outerRadius }
        const datum = interpolate(arcNode._animState, nextAnimState)

        return (t: number): string => {
          arcNode._animState = datum(t)
          return arcGen(arcNode._animState as DonutArcDatum<Datum>)
        }
      })
  } else {
    selection
      .attr('d', arcGen)
      .style('opacity', 1)
  }
}

export function removeArc<Datum> (
  selection: Selection<SVGElement, DonutArcDatum<Datum>, SVGGElement, DonutArcDatum<Datum>[]>,
  duration: number
): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
