import { Selection, select } from 'd3-selection'
import { Transition } from 'd3-transition'
import { interpolatePath } from 'd3-interpolate-path'

// Utils
import { smartTransition } from 'utils/d3'

// Types
import { Hierarchy, Ribbon } from 'components/radial-dendrogram/types'

export interface ArcLink extends SVGElement {
  _animState?: {
    source: { y0: number; y1: number };
    target: { x0: number; x1: number; y1: number };
  };
}

export function emptyPath (): string {
  return 'M0,0 L0,0'
}

export function createLink<H extends Hierarchy, L extends Ribbon<H>> (selection: Selection<SVGPathElement, L, SVGGElement, L[]>, areaGen): void {
  selection
    .attr('d', d => areaGen(d.points) || this._emptyPath())
    .style('opacity', 0)
}

export function updateLink<H extends Hierarchy, L extends Ribbon<H>> (selection: Selection<SVGElement, L, SVGGElement, L[]>, areaGen, duration: number): void {
  const selTransition = smartTransition(selection, duration)
    .style('opacity', 0.7)
  if (duration) {
    const transition = selTransition as Transition<SVGElement, L, SVGGElement, L[]>
    transition.attrTween('d', (d, i, el) => {
      const previous = select(el[i]).attr('d')
      const next = areaGen(d.points) || this._emptyPath()
      return interpolatePath(previous, next)
    })
  } else {
    selTransition.attr('d', d => areaGen(d.points))
  }
}

export function removeLink (selection: any, duration: number): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
