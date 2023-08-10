import { Selection, select } from 'd3-selection'
import { ribbon } from 'd3-chord'
import { path } from 'd3-path'
import { ScalePower } from 'd3-scale'
import { areaRadial } from 'd3-shape'
import { Transition } from 'd3-transition'
import { interpolatePath } from 'd3-interpolate-path'

// Types
import { Curve } from 'types/curve'

// Utils
import { getColor } from 'utils/color'
import { smartTransition } from 'utils/d3'
import { convertLineToArc } from 'utils/path'

// Local Types
import { ChordInputLink, ChordInputNode, ChordRibbon, ChordRibbonPoint } from '../types'
import { ChordDiagramConfig } from '../config'

// Generators
export function emptyPath (): string {
  return 'M0,0 L0,0'
}

// Generators
const ribbonGen = ribbon<ChordRibbonPoint[], ChordRibbonPoint>()
  .source(d => d[0])
  .target(d => d[d.length - 1])
  .startAngle(d => d.a0)
  .endAngle(d => d.a1)

const areaGen = areaRadial<ChordRibbonPoint>()
  .curve(Curve.catmullRom.alpha(0.5))
  .startAngle((d, i, points) => i < points.length / 2 ? d.a1 : d.a0)
  .endAngle((d, i, points) => i < points.length / 2 ? d.a0 : d.a1)


// Creates a path from set of points
function linkGen (points: ChordRibbonPoint[], radiusScale: ScalePower<number, number>): string {
  const link = (points.length === 2 ? ribbonGen : areaGen)
  link.radius(d => radiusScale(d.r))

  if (points.length === 2) {
    return link(points) as string
  }
  const p = path()
  const src = points[0]
  const radius = Math.max(radiusScale(src.r), 0)

  link.context(p as CanvasRenderingContext2D)
  link(points)
  p.arc(0, 0, radius, src.a0 - Math.PI / 2, src.a1 - Math.PI / 2, src.a1 - src.a0 <= Number.EPSILON)

  return convertLineToArc(p, radius)
}

export function createLink<N extends ChordInputNode> (
  selection: Selection<SVGPathElement, ChordRibbon<N>, SVGGElement, unknown>,
  radiusScale: ScalePower<number, number>
): void {
  selection
    .attr('d', d => linkGen(d.points, radiusScale) || emptyPath())
    .style('opacity', 0)
}

export function updateLink<N extends ChordInputNode, L extends ChordInputLink> (
  selection: Selection<SVGPathElement, ChordRibbon<N>, SVGGElement, unknown>,
  config: ChordDiagramConfig<N, L>,
  radiusScale: ScalePower<number, number>,
  duration: number
): void {
  selection
    .style('transition', `fill-opacity: ${duration}ms`)
    .style('fill', d => getColor(d.data, config.linkColor))
    .style('stroke', d => getColor(d.data, config.linkColor))

  const transition = smartTransition(selection, duration)
    .style('opacity', 1) as Transition<SVGPathElement, ChordRibbon<N>, SVGGElement, unknown>

  if (duration) {
    transition.attrTween('d', (d, i, el) => {
      const previous = select(el[i]).attr('d')
      const next = linkGen(d.points, radiusScale) || emptyPath()
      return interpolatePath(previous, next)
    })
  } else {
    transition.attr('d', d => linkGen(d.points, radiusScale) || emptyPath())
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
