// Copyright (c) Volterra, Inc. All rights reserved.

import { pie, arc } from 'd3-shape'

// Utils
import { isNil } from 'utils/data'

// Types
import { pieDataValue } from 'types/map'

const pieConstructor = pie<pieDataValue>()
  .sort(null)
  .value((d: pieDataValue): number => d.value)

export function updateDonut (selection, data, options): void {
  const { radius, statusStyle } = options
  const arcWidth = isNil(options.arcWidth) ? 2 : options.arcWidth
  const padAngle = isNil(options.padAngle) ? 0.05 : options.padAngle

  pieConstructor.padAngle(padAngle)
  const arcs = pieConstructor(data.filter((d: pieDataValue) => d.value))

  const donuts = selection.selectAll('path')
    .data(arcs)

  donuts.exit().remove()

  donuts.enter()
    .append('path')
    .merge(donuts)
    .attr('d', arc()
      .innerRadius(radius - arcWidth * 0.5)
      .outerRadius(radius + arcWidth * 0.5))
    .style('fill', d => {
      return statusStyle?.[d.data.status]?.fill
    })
}
