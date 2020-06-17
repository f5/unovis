// Copyright (c) Volterra, Inc. All rights reserved.
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

export function linkPath (link, background = false): string {
  const w = Math.max(background ? 10 : 1, link.width)
  const centerX = (link.source.x1 + link.target.x0) / 2

  return `
    M ${link.source.x1}, ${link.y0 - w / 2}

    C ${centerX}, ${link.y0 - w / 2}
      ${centerX}, ${link.y1 - w / 2}
      ${link.target.x0}, ${link.y1 - w / 2}
    
    L ${link.target.x0}, ${link.y1 + w / 2}
    
    C ${centerX}, ${link.y1 + w / 2}
      ${centerX}, ${link.y0 + w / 2}
      ${link.source.x1}, ${link.y0 + w / 2}
    z
  `
}

export function createLinks (sel): void {
  sel.append('path').attr('class', s.visibleLink)
    .attr('d', d => linkPath(d))
  sel.append('path').attr('class', s.transparentLink)
  sel.style('opacity', 0)
}

export function updateLinks<N extends SankeyNodeDatumInterface, L extends SankeyLinkDatumInterface> (sel, config: SankeyConfig<N, L>, duration): void {
  smartTransition(sel, duration)
    .style('opacity', 1)
  const linkSelection = sel.select(`.${s.visibleLink}`)
  const linkSelectionChanged = smartTransition(linkSelection, duration)
    .style('fill', link => getColor(link, config.linkColor))

  if (duration) {
    linkSelectionChanged
      .attrTween('d', (d, i, el) => {
        const previous = select(el[i]).attr('d')
        const next = linkPath(d)
        return interpolatePath(previous, next)
      })
  } else {
    linkSelection.attr('d', d => linkPath(d))
  }

  sel.select(`.${s.transparentLink}`)
    .attr('d', d => linkPath(d, true))
}

export function removeLinks (sel): void {
  sel.remove()
}
