// Copyright (c) Volterra, Inc. All rights reserved.
import { sankeyLinkHorizontal } from 'd3-sankey'

// Utils
import { getValue } from 'utils/data'
import { getColor } from 'utils/color'

// Types
import { SankeyNodeDatumInterface, SankeyLinkDatumInterface } from './types'

// Config
import { SankeyConfig } from '../config'

// Styles
import * as s from '../style'

export function createLinks (sel): void {
  sel.append('path').attr('class', s.visibleLink)
  sel.append('path').attr('class', s.transparentLink)
}

export function updateLinks<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (sel, config: SankeyConfig<N, L>): void {
  sel.select(`.${s.visibleLink}`)
    .attr('d', sankeyLinkHorizontal())
    .style('stroke-width', link => Math.max(1, getValue(link, config.linkWidth)))
    .style('stroke', node => getColor(node, config.linkColor))

  sel.select(`.${s.transparentLink}`)
    .attr('d', sankeyLinkHorizontal())
    .style('stroke-width', link => Math.max(10, getValue(link, config.linkWidth)))
}

export function removeLinks (sel): void {
  sel.exit().remove()
}
