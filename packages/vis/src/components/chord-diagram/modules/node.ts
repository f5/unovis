// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection } from 'd3-selection'
import { interpolate } from 'd3-interpolate'
import { HierarchyRectangularNode } from 'd3-hierarchy'
import { Arc } from 'd3-shape'

// Utils
import { getColor } from 'utils/color'
import { smartTransition } from 'utils/d3'

// Types
import { Hierarchy } from 'types/radial-dendrogram'

// Config
import { ChordDiagramConfig } from '../config'

export interface ArcNode extends SVGElement {
  _animState?: { x0: number; x1: number; y0: number; y1: number };
}

export function createNode<H extends Hierarchy> (selection: Selection<SVGPathElement, HierarchyRectangularNode<H>, SVGGElement, HierarchyRectangularNode<H>[]>, config: ChordDiagramConfig<H>): void {
  selection
    .style('fill', d => getColor(d.data, config.nodeColor, d.height))
    .style('stroke', d => getColor(d.data, config.nodeColor, d.height))
    .style('opacity', 0)
    .each((d, i, els) => {
      const arcNode: ArcNode = els[i]
      const angleCenter = (d.x0 + d.x1) / 2
      const angleHalfWidth = (d.x1 - d.x0) / 2
      arcNode._animState = {
        x0: angleCenter - angleHalfWidth * 0.8,
        x1: angleCenter + angleHalfWidth * 0.8,
        y0: d.y0,
        y1: d.y1,
      }
    })
}

export function updateNode<H extends Hierarchy> (selection: Selection<SVGElement, HierarchyRectangularNode<H>, SVGGElement, HierarchyRectangularNode<H>[]>, config: ChordDiagramConfig<H>, arcGen: Arc<any, any>, duration: number): void {
  selection
    .attr('id', d => d.data.id ?? d.data.key)
    .style('transition', `fill ${duration}ms`) // Animate color with CSS because we're using CSS-variables
    .style('fill', d => getColor(d.data, config.nodeColor, d.height))
    .style('stroke', d => getColor(d.data, config.nodeColor, d.height))

  if (duration) {
    smartTransition(selection, duration)
      .style('opacity', 1)
      .attrTween('d', (d, i, els) => {
        const arcNode: ArcNode = els[i]
        const nextAnimState = { x0: d.x0, x1: d.x1, y0: d.y0, y1: d.y1 }
        const datum = interpolate(arcNode._animState, nextAnimState)

        return (t: number): string => {
          arcNode._animState = datum(t)
          return arcGen(arcNode._animState)
        }
      })
  } else {
    selection.attr('d', d => arcGen(d))
  }
}

export function removeNode<H> (selection: Selection<SVGElement, HierarchyRectangularNode<H>, SVGGElement, HierarchyRectangularNode<H>[]>, duration: number): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
