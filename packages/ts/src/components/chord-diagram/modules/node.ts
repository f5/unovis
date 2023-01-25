import { Selection } from 'd3-selection'
import { Transition } from 'd3-transition'
import { interpolate } from 'd3-interpolate'
import { Arc } from 'd3-shape'

// Utils
import { getColor } from 'utils/color'
import { smartTransition } from 'utils/d3'

// Local Types
import { ChordInputNode, ChordInputLink, ChordNode } from '../types'

// Config
import { ChordDiagramConfig } from '../config'

type AnimState = { x0: number; x1: number; y0: number; y1: number }
export interface ArcNode extends SVGElement {
  _animState?: AnimState;
}

export function createNode<N extends ChordInputNode, L extends ChordInputLink> (
  selection: Selection<SVGPathElement, ChordNode<N>, SVGGElement, unknown>,
  config: ChordDiagramConfig<N, L>
): void {
  selection
    .style('fill', d => getColor(d, config.nodeColor, d.height))
    .style('stroke', d => getColor(d, config.nodeColor, d.height))
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

export function updateNode<N extends ChordInputNode, L extends ChordInputLink> (
  selection: Selection<SVGElement, ChordNode<N>, SVGGElement, ChordNode<N>[]>,
  config: ChordDiagramConfig<N, L>,
  arcGen: Arc<unknown, AnimState>,
  duration: number
): void {
  selection
    .attr('id', (d, i) => `chord-node-${i}`)
    .style('transition', `fill ${duration}ms`) // Animate color with CSS because we're using CSS-variables
    .style('fill', d => getColor(d.data, config.nodeColor, d.depth))
    .style('stroke', d => getColor(d, config.nodeColor, d.depth))

  if (duration) {
    const transition = smartTransition(selection, duration)
      .style('opacity', 1) as Transition<SVGElement, ChordNode<N>, SVGGElement, ChordNode<N>[]>

    transition.attrTween('d', (d, i, els) => {
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

export function removeNode<N extends ChordInputNode, L extends ChordInputLink> (
  selection: Selection<SVGElement, ChordNode<N>, SVGGElement, unknown>,
  duration: number
): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
