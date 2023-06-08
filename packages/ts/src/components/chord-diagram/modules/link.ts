import { Selection, select } from 'd3-selection'
import { path } from 'd3-path'
import { line } from 'd3-shape'
import { Transition } from 'd3-transition'
import { interpolatePath } from 'd3-interpolate-path'

// Types
import { Curve } from 'types/curve'

// Utils
import { getColor } from 'utils/color'
import { smartTransition } from 'utils/d3'

// Local Types
import { ChordInputLink, ChordInputNode, ChordRibbon, ChordRibbonPoint } from '../types'
import { ChordDiagramConfig } from '../config'

export interface ArcLink extends SVGElement {
  _animState?: {
    source: { y0: number; y1: number };
    target: { x0: number; x1: number; y1: number };
  };
}

export function emptyPath (): string {
  return 'M0,0 L0,0'
}

const lineGen = line().curve(Curve.catmullRom.alpha(0.25))

// Creates a path consisting of the inner source arc, node arcs and connecting curves
function linkGen (points: ChordRibbonPoint[]): string {
  const p = path()
  const sourceArc = points[0]
  const targetArc = points[points.length - 1]

  if (points.length === 2) {
    // Writing a custom curve here since generators won't produce a curved line from only two points
    p.moveTo(sourceArc.x1, sourceArc.y1)
    p.quadraticCurveTo(0, 0, targetArc.x0, targetArc.y0)
    p.arc(0, 0, targetArc.r, targetArc.a0, targetArc.a1)
    p.quadraticCurveTo(0, 0, sourceArc.x0, sourceArc.y0)
    p.arc(0, 0, sourceArc.r, sourceArc.a0, sourceArc.a1)
  } else {
    const inner: [number, number][] = points.map((d, i) => i < points.length / 2 ? [d.x1, d.y1] : [d.x0, d.y0])
    const outer: [number, number][] = points.map((d, i) => i < points.length / 2 ? [d.x0, d.y0] : [d.x1, d.y1])

    lineGen.context(p as CanvasRenderingContext2D)
    lineGen(inner)
    p.arc(0, 0, targetArc.r, targetArc.a0, targetArc.a1)
    lineGen(outer.reverse())
    p.arc(0, 0, sourceArc.r, sourceArc.a0, sourceArc.a1)
  }
  return p.toString()
}

export function createLink<N extends ChordInputNode> (
  selection: Selection<SVGPathElement, ChordRibbon<N>, SVGGElement, unknown>
): void {
  selection
    .attr('d', d => linkGen(d.points) || emptyPath())
    .style('opacity', 0)
}

export function updateLink<N extends ChordInputNode, L extends ChordInputLink> (
  selection: Selection<SVGPathElement, ChordRibbon<N>, SVGGElement, unknown>,
  config: ChordDiagramConfig<N, L>,
  duration: number
): void {
  const selTransition = smartTransition(selection, duration)
    .style('fill', d => getColor(d.data, config.linkColor))
    .style('stroke', d => getColor(d.data, config.linkColor))
    .style('opacity', 'var(--vis-chord-diagram-link-opacity)')

  if (duration) {
    const transition = selTransition as Transition<SVGPathElement, ChordRibbon<N>, SVGGElement, unknown>
    transition.attrTween('d', (d, i, el) => {
      const previous = select(el[i]).attr('d')
      const next = linkGen(d.points) || emptyPath()
      return interpolatePath(previous, next)
    })
  } else {
    selTransition.attr('d', d => linkGen(d.points) || emptyPath())
  }
}

export function removeLink (
  selection: Selection<SVGPathElement, unknown, SVGGElement, unknown>,
  duration: number
): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
