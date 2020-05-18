// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection, select } from 'd3-selection'
import { interpolatePath } from 'd3-interpolate-path'

// Utils
import { smartTransition } from 'utils/d3'

// Types
import { Hierarchy, Link } from 'types/radial-dendrogram'

export interface ArcLink extends SVGElement {
  _animState?: {
    source: { y0: number; y1: number };
    target: { x0: number; x1: number; y1: number };
  };
}

export function emptyPath (): string {
  return 'M0,0 L0,0'
}

export function createLink<L extends Link<Hierarchy>> (selection: Selection<SVGPathElement, L, SVGGElement, L[]>, areaGen): void {
  selection
    .attr('d', d => areaGen(d.points) || this._emptyPath())
    .style('opacity', 0)
}

export function updateLink<L extends Link<Hierarchy>> (selection: Selection<SVGElement, L, SVGGElement, L[]>, areaGen, duration: number): void {
  const selTransition = smartTransition(selection, duration)
    .style('opacity', 0.7)
  if (duration) {
    selTransition.attrTween('d', (d, i, el) => {
      const previous = select(el[i]).attr('d')
      const next = areaGen(d.points) || this._emptyPath()
      return interpolatePath(previous, next)
    })
  } else {
    selTransition.attr('d', d => areaGen(d.points))
  }
}

export function removeLink<L extends Link<Hierarchy>> (selection: Selection<SVGPathElement, L, SVGGElement, L[]>, duration: number): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
