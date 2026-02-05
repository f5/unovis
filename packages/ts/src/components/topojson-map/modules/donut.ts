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
  strokeWidth = 1,
  padAngle = 0.05
): void {
  pieConstructor.padAngle(padAngle)
  const arcs = pieConstructor(data.filter(d => d.value))

  // If arcWidth equals radius, render as a full pie chart (no inner radius)
  // Otherwise render as a donut chart with the specified arc width
  const isPieChart = arcWidth >= radius
  const arcPathGen = arc<PieArcDatum<TopoJSONMapPieDatum>>()
    .innerRadius(isPieChart ? 0 : radius - arcWidth / 2)
    .outerRadius(isPieChart ? radius : radius + arcWidth / 2)

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
    .style('stroke-width', strokeWidth)
}
