import { Selection, select } from 'd3-selection'
import { ribbon } from 'd3-chord'
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
import { ChordDiagramConfigInterface } from '../config'

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

  const linkPath = link(points) as string

  if (points.length === 2) return linkPath

  // Replace closePath with line to starting point
  const area = linkPath.slice(0, -1)
  const path = area.concat(`L${area.match(/M-?\d*\.?\d*[,\s*]-?\d*\.?\d*/)?.[0].slice(1)}`)

  // Convert line edges to arcs
  const radius = Math.max(radiusScale(points[0].r), 0)
  return convertLineToArc(path, radius)
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
  selection: Selection<SVGPathElement, ChordRibbon<N, L>, SVGGElement, unknown>,
  config: ChordDiagramConfigInterface<N, L>,
  radiusScale: ScalePower<number, number>,
  duration: number
): void {
  selection
    .style('transition', `fill-opacity: ${duration}ms`)
    .style('fill', d => getColor(d.data, config.linkColor))
    .style('stroke', d => getColor(d.data, config.linkColor))

  const transition = smartTransition(selection, duration)
    .style('opacity', 1) as Transition<SVGPathElement, ChordRibbon<N, L>, SVGGElement, unknown>

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
