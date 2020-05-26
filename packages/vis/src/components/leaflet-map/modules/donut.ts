// Copyright (c) Volterra, Inc. All rights reserved.

import { pie, arc } from 'd3-shape'

// Types
import { PieDatum } from 'types/map'

const pieConstructor = pie<PieDatum>()
  .sort(null)
  .value((d: PieDatum): number => d.value)

export function updateDonut (selection, data, { radius, statusMap, arcWidth = 2, padAngle = 0.05 }): void {
  pieConstructor.padAngle(padAngle)
  const arcs = pieConstructor(data.filter((d: PieDatum) => d.value))

  const donuts = selection.selectAll('path')
    .data(arcs)

  donuts.exit().remove()

  donuts.enter()
    .append('path')
    .merge(donuts)
    .attr('class', d => statusMap?.[d.data.status]?.className ?? null)
    .attr('d', arc()
      .innerRadius(radius - arcWidth * 0.5)
      .outerRadius(radius + arcWidth * 0.5)
    )
    .style('fill', d => statusMap?.[d.data.status]?.color ?? null)
    .style('stroke', d => statusMap?.[d.data.status]?.color ?? null)
}
