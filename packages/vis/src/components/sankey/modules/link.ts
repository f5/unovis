// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection } from 'd3-selection'
import { Transition } from 'd3-transition'
import { interpolateNumber } from 'd3-interpolate'

// Utils
import { getColor } from 'utils/color'
import { getValue } from 'utils/data'
import { smartTransition } from 'utils/d3'

// Types
import { InputLink, InputNode, SankeyLink } from 'types/sankey'

// Config
import { SankeyConfig } from '../config'

// Styles
import * as s from '../style'

export function linkPath ({ x0, x1, y0, y1, width }): string {
  const top0 = y0 - width / 2
  const top1 = y1 - width / 2
  const bottom0 = y0 + width / 2
  const bottom1 = y1 + width / 2
  const centerX = (x0 + x1) / 2

  return `
    M ${x0}, ${top0}

    C ${centerX}, ${top0}
      ${centerX}, ${top1}
      ${x1}, ${top1}
    
    L ${x1}, ${bottom1}
    
    C ${centerX}, ${bottom1}
      ${centerX}, ${bottom0}
      ${x0}, ${bottom0}
    z
  `
}

export function createLinks<N extends InputNode, L extends InputLink> (sel: Selection<SVGGElement, SankeyLink<N, L>, SVGGElement, any>): void {
  sel.append('path').attr('class', s.linkPath)
    .attr('d', (d: SankeyLink<N, L>, i, el) => {
    // eslint-disable-next-line dot-notation
      el[i]['_animState'] = {
        x0: d.source.x1,
        x1: d.target.x0,
        y0: d.y0,
        y1: d.y1,
        width: Math.max(1, d.width),
      }
      // eslint-disable-next-line dot-notation
      return linkPath(el[i]['_animState'])
    })
  sel.append('path').attr('class', s.linkSelectionHelper)
  sel.style('opacity', 0)
}

export function updateLinks<N extends InputNode, L extends InputLink> (sel: Selection<SVGGElement, SankeyLink<N, L>, SVGGElement, any>, config: SankeyConfig<N, L>, duration): void {
  smartTransition(sel, duration)
    .style('opacity', (d: SankeyLink<N, L>) => d._state.greyout ? 0.2 : 1)

  const linkSelection = sel.select(`.${s.linkPath}`)
    .style('cursor', (d: SankeyLink<N, L>) => getValue(d, config.linkCursor))

  const selectionTransition = smartTransition(linkSelection, duration)
    .style('fill', (link: SankeyLink<N, L>) => getColor(link, config.linkColor))

  if (duration) {
    (selectionTransition as Transition<SVGGElement, SankeyLink<N, L>, SVGGElement, any>)
      .attrTween('d', (d: SankeyLink<N, L>, i, el) => {
      // eslint-disable-next-line dot-notation
        const previous = el[i]['_animState']
        const next = {
          x0: d.source.x1,
          x1: d.target.x0,
          y0: d.y0,
          y1: d.y1,
          width: Math.max(1, d.width),
        }
        const interpolator = {
          x0: interpolateNumber(previous.x0, next.x0),
          x1: interpolateNumber(previous.x1, next.x1),
          y0: interpolateNumber(previous.y0, next.y0),
          y1: interpolateNumber(previous.y1, next.y1),
          width: interpolateNumber(previous.width, next.width),
        }
        // eslint-disable-next-line dot-notation
        el[i]['_animState'] = next

        return function (t: number) {
          return linkPath({
            x0: interpolator.x0(t),
            x1: interpolator.x1(t),
            y0: interpolator.y0(t),
            y1: interpolator.y1(t),
            width: interpolator.width(t),
          })
        }
      })
  } else {
    linkSelection.attr('d', (d: SankeyLink<N, L>) => linkPath({
      x0: d.source.x1,
      x1: d.target.x0,
      y0: d.y0,
      y1: d.y1,
      width: Math.max(1, d.width),
    }))
  }

  sel.select(`.${s.linkSelectionHelper}`)
    .attr('d', (d: SankeyLink<N, L>) => linkPath({
      x0: d.source.x1,
      x1: d.target.x0,
      y0: d.y0,
      y1: d.y1,
      width: Math.max(10, d.width),
    }))
    .style('cursor', d => getValue(d, config.linkCursor))
}

export function removeLinks (sel): void {
  sel.remove()
}
