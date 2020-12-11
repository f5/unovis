// Copyright (c) Volterra, Inc. All rights reserved.

import { pie, arc } from 'd3-shape'

// Types
import { PieDatum } from 'types/map'

const pieConstructor = pie<PieDatum>()
  .sort(null)
  .value((d: PieDatum): number => d.value)

export function updateDonut (selection, data, radius, arcWidth = 2, padAngle = 0.05): void {
  pieConstructor.padAngle(padAngle)
  const arcs = pieConstructor(data.filter((d: PieDatum) => d.value))

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
