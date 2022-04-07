// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection } from 'd3-selection'
import { pie, arc, PieArcDatum } from 'd3-shape'

// Local Types
import { LeafletMapPieDatum } from '../types'

const pieConstructor = pie<LeafletMapPieDatum>()
  .sort(null)
  .value((d: LeafletMapPieDatum): number => d.value)

export function updateDonut (
  selection: Selection<SVGGElement, unknown, null, undefined>,
  data: LeafletMapPieDatum[],
  radius: number,
  arcWidth = 2,
  padAngle = 0.05
): void {
  pieConstructor.padAngle(padAngle)
  const arcs = pieConstructor(data.filter(d => d.value))

  const arcPathGen = arc<PieArcDatum<LeafletMapPieDatum>>()
    .innerRadius(arcWidth ? radius - arcWidth / 2 : 0)
    .outerRadius(arcWidth ? radius + arcWidth / 2 : radius)

  const donuts = selection.selectAll<SVGPathElement, LeafletMapPieDatum>('path')
    .data(arcs)

  donuts.exit().remove()

  donuts.enter()
    .append('path')
    .merge(donuts)
    .attr('class', d => d.data.className ?? null)
    .attr('d', arcPathGen)
    .style('fill', d => d.data.color ?? null)
    .style('stroke', d => d.data.color ?? null)
}
