// Copyright (c) Volterra, Inc. All rights reserved.
import { sankeyLinkHorizontal } from 'd3-sankey'
import { select } from 'd3-selection'
import { interpolatePath } from 'd3-interpolate-path'

// Utils
import { getColor } from 'utils/color'
import { smartTransition } from 'utils/d3'

// Types
import { SankeyNodeDatumInterface, SankeyLinkDatumInterface } from 'types/sankey'

// Config
import { SankeyConfig } from '../config'

// Styles
import * as s from '../style'

export function createLinks (sel): void {
  sel.append('path').attr('class', s.visibleLink)
    .attr('stroke-width', link => Math.max(1, link.width))
    .attr('d', sankeyLinkHorizontal())
  sel.append('path').attr('class', s.transparentLink)
  sel.style('opacity', 0)
}

export function updateLinks<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (sel, config: SankeyConfig<N, L>, duration): void {
  smartTransition(sel, duration)
    .style('opacity', 1)
  const linkSelection = sel.select(`.${s.visibleLink}`)
  const linkSelectionChanged = smartTransition(linkSelection, duration)
    .attr('stroke-width', link => Math.max(1, link.width))
    .style('stroke', link => getColor(link, config.linkColor))

  if (duration) {
    linkSelectionChanged
      .attrTween('d', (d, i, el) => {
        const previous = select(el[i]).attr('d')
        const next = sankeyLinkHorizontal()(d)
        return interpolatePath(previous, next)
      })
  } else {
    linkSelection.attr('d', sankeyLinkHorizontal())
  }

  sel.select(`.${s.transparentLink}`)
    .attr('d', sankeyLinkHorizontal())
    .style('stroke-width', link => Math.max(10, link.width))
}

export function removeLinks (sel): void {
  sel.remove()
}
