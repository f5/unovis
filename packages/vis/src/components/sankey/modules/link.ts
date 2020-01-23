// Copyright (c) Volterra, Inc. All rights reserved.
import { sankeyLinkHorizontal } from 'd3-sankey'

// Utils
import { getValue } from 'utils/data'

export function createLinks (sel): void {
  sel.append('path').attr('class', 'visible')
  sel.append('path').attr('class', 'transparent')
}

export function updateLinks (sel, config): void {
  sel.select('.visible')
    .attr('d', sankeyLinkHorizontal())
    .style('stroke-width', link => Math.max(1, getValue(link, d => d[config.accessor.linkWidth])))

  sel.select('.transparent')
    .attr('d', sankeyLinkHorizontal())
    .style('stroke-width', link => Math.max(10, getValue(link, d => d[config.accessor.linkWidth])))
}

export function removeLinks (sel): void {
  sel.exit().remove()
}
