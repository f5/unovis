// Copyright (c) Volterra, Inc. All rights reserved.
import { sankeyLinkHorizontal } from 'd3-sankey'

// Utils
import { getValue } from 'utils/data'

// Styles
import * as s from '../style'

export function createLinks (sel): void {
  sel.append('path').attr('class', s.visibleLink)
  sel.append('path').attr('class', s.transparentLink)
}

export function updateLinks (sel, config): void {
  sel.select(`.${s.visibleLink}`)
    .attr('d', sankeyLinkHorizontal())
    .style('stroke-width', link => Math.max(1, getValue(link, config.linkWidth)))

  sel.select(`.${s.transparentLink}`)
    .attr('d', sankeyLinkHorizontal())
    .style('stroke-width', link => Math.max(10, getValue(link, config.linkWidth)))
}

export function removeLinks (sel): void {
  sel.exit().remove()
}
