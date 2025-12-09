import { Selection } from 'd3-selection'
import { pie, arc, PieArcDatum } from 'd3-shape'

// Local Types
import { TopoJSONMapPieDatum } from '../types'

const pieConstructor = pie<TopoJSONMapPieDatum>()
  .sort(null)
  .value((d: TopoJSONMapPieDatum): number => d.value)

export function updateDonut (
  selection: Selection<SVGGElement, unknown, null, undefined>,
  data: TopoJSONMapPieDatum[],
  radius: number,
  arcWidth = 2,
  padAngle = 0.05
): void {
  pieConstructor.padAngle(padAngle)
  const arcs = pieConstructor(data.filter(d => d.value))

  const arcPathGen = arc<PieArcDatum<TopoJSONMapPieDatum>>()
    .innerRadius(radius) // Start from the edge of the main circle
    .outerRadius(radius + arcWidth) // Extend outward to create a ring

  const donuts = selection.selectAll<SVGPathElement, TopoJSONMapPieDatum>('path')
    .data(arcs)

  donuts.exit().remove()

  donuts.enter()
    .append('path')
    .merge(donuts)
    .attr('class', d => d.data.className ?? null)
    .attr('d', arcPathGen)
    .style('fill', d => d.data.color ?? null)
    .style('stroke', d => d.data.color ?? null)
}
