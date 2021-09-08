// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection } from 'd3-selection'
import { Transition } from 'd3-transition'
import { interpolate } from 'd3-interpolate'
import { Arc } from 'd3-shape'

// Utils
import { smartTransition } from 'utils/d3'

// Local Types
import { Hierarchy, Link } from '../types'

export interface ArcLink extends SVGElement {
  _animState?: {
    source: { y0: number; y1: number };
    target: { x0: number; x1: number; y1: number };
  };
}

export function createLink<L extends Link<Hierarchy>> (selection: Selection<SVGPathElement, L, SVGGElement, L[]>): void {
  selection
    .style('opacity', 0)
    .each((d, i, els) => {
      const arcLink: ArcLink = els[i]
      const angleCenter = (d.target.x0 + d.target.x1) / 2
      const angleHalfWidth = (d.target.x1 - d.target.x0) / 2
      arcLink._animState = {
        target: {
          x0: angleCenter - angleHalfWidth * 0.8,
          x1: angleCenter + angleHalfWidth * 0.8,
          y1: d.target.y1,
        },
        source: {
          y0: d.source.y0,
          y1: d.source.y1,
        },
      }
    })
}

export function updateLink<L extends Link<Hierarchy>> (selection: Selection<SVGPathElement, L, SVGGElement, L[]>, linkArcGen: Arc<any, any>, duration: number): void {
  if (duration) {
    const transition = smartTransition(selection, duration)
      .style('opacity', 1) as Transition<SVGElement, L, SVGGElement, L[]>

    transition.attrTween('d', (d, i, els) => {
      const arcLink: ArcLink = els[i]
      const nextAnimState = {
        target: {
          x0: d.target.x0,
          x1: d.target.x1,
          y1: d.target.y1,
        },
        source: {
          y0: d.source.y0,
          y1: d.source.y1,
        },
      }
      const datum = interpolate(arcLink._animState, nextAnimState)

      return (t: number): string => {
        arcLink._animState = datum(t)
        return linkArcGen(arcLink._animState)
      }
    })
  } else {
    selection.attr('d', d => linkArcGen(d))
  }
}

export function removeLink<L extends Link<Hierarchy>> (selection: Selection<SVGPathElement, L, SVGGElement, L[]>, duration: number): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
