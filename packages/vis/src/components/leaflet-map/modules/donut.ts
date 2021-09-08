// Copyright (c) Volterra, Inc. All rights reserved.

import { pie, arc } from 'd3-shape'

// Local Types
import { LeafletMapPieDatum } from '../types'

const pieConstructor = pie<LeafletMapPieDatum>()
  .sort(null)
  .value((d: LeafletMapPieDatum): number => d.value)

export function updateDonut (selection, data, radius, arcWidth = 2, padAngle = 0.05): void {
  pieConstructor.padAngle(padAngle)
  const arcs = pieConstructor(data.filter((d: LeafletMapPieDatum) => d.value))

  const donuts = selection.selectAll('path')
    .data(arcs)

  donuts.exit().remove()

  donuts.enter()
    .append('path')
    .merge(donuts)
    .attr('class', d => d.data.className ?? null)
    .attr('d', arc()
      .innerRadius(arcWidth ? radius - arcWidth * 0.5 : 0)
      .outerRadius(arcWidth ? radius + arcWidth * 0.5 : radius)
    )
    .style('fill', d => d.data.color ?? null)
    .style('stroke', d => d.data.color ?? null)
}
