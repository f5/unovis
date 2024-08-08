import { group, max, mean, min } from 'd3-array'
import { Selection } from 'd3-selection'

import { getTransformValues, Graph, GraphNode } from '@unovis/ts'

import { CustomGraphLink, CustomGraphNode, CustomGraphSwimlane } from './types'

import * as s from './styles'

export const updateSwimlanes = (g: Selection<SVGGElement, unknown, null, undefined>): void => {
  const svgGraph = g.select(`.${Graph.selectors.graphGroup}`)
  const transform = getTransformValues(svgGraph.node() as SVGElement)

  g.selectAll<SVGGElement, CustomGraphSwimlane>(`.${s.swimlaneRect}`)
    .attr('transform', `translate(${transform.translate.x}, 0) scale(${transform.scale.x}, 1)`)

  g.selectAll<SVGGElement, CustomGraphSwimlane>(`.${s.swimlaneLabel}`)
    .attr('transform', `translate(${transform.translate.x}, 0) scale(${transform.scale.x}, 1)`)

  g.selectAll<SVGTextElement, CustomGraphSwimlane>(`.${s.swimlaneLabelText}`)
    .attr('transform', lane => `scale(${1 / transform.scale.x}, 1) translate(${lane.xCenter * transform.scale.x}, 0)`)

  g.selectAll<SVGRectElement, CustomGraphSwimlane>(`.${s.swimlaneLabelBackground}`)
    .attr('transform', lane => `scale(${1 / transform.scale.x}, 1) translate(${lane.xCenter * transform.scale.x}, 0)`)
}

export const renderSwimlanes = (
  g: Selection<SVGGElement, unknown, null, undefined>,
  nodes: GraphNode<CustomGraphNode, CustomGraphLink>[]
): void => {
  const nodesGrouped = group(nodes, d => d.type)
  const largeSvgNumber = 9999
  const swimlanes = Array.from(nodesGrouped.entries()).map(([key, nodes], i) => ({
    index: i,
    label: key,
    xCenter: mean(nodes, (d: GraphNode<CustomGraphNode, CustomGraphLink>) => d.x) as number,
    xMin: min(nodes, (d: GraphNode<CustomGraphNode, CustomGraphLink>) => d.x) as number,
    xMax: max(nodes, (d: GraphNode<CustomGraphNode, CustomGraphLink>) => d.x) as number,
    x1: 0,
    x2: 0,
  })) as CustomGraphSwimlane[]

  for (const [index, lane] of swimlanes.entries()) {
    const i = swimlanes.length === 1 ? -1 : index
    switch (i) {
      case -1:
        lane.x1 = -largeSvgNumber
        lane.x2 = largeSvgNumber
        break
      case 0:
        lane.x1 = -largeSvgNumber
        lane.x2 = (lane.xMax + swimlanes[i + 1].xMin) / 2
        break
      case swimlanes.length - 1:
        lane.x1 = (lane.xMin + swimlanes[i - 1].xMax) / 2
        lane.x2 = largeSvgNumber
        break
      default:
        lane.x1 = (lane.xMin + swimlanes[i - 1].xMax) / 2
        lane.x2 = (lane.xMax + swimlanes[i + 1].xMin) / 2
        lane.xCenter = (lane.x1 + lane.x2) / 2
        break
    }
  }

  // Rendering
  // Rects in the background
  const svgSwimlaneRects = g.selectAll<SVGRectElement, CustomGraphSwimlane>(`.${s.swimlaneRect}`)
    .data(swimlanes)

  const svgSwimlanesRectsEnter = svgSwimlaneRects.enter()
    .insert('rect', ':first-child')
    .attr('class', s.swimlaneRect)
    .style('opacity', 0);

  // D3 types are not correct
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (svgSwimlanesRectsEnter as any).transition()
    .style('opacity', 1)

  const svgSwimlanesRectsMerged = svgSwimlaneRects.merge(svgSwimlanesRectsEnter)
  svgSwimlanesRectsMerged
    .attr('x', lane => lane.x1)
    .attr('width', lane => lane.x2 - lane.x1)
    .attr('y', -largeSvgNumber)
    .attr('height', largeSvgNumber * 2)
    .style('fill', lane => lane.index % 2 ? 'var(--unovis-background-primary)' : 'var(--unovis-background-secondary)');

  // D3 types are not correct
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (svgSwimlaneRects.exit() as any)
    .transition()
    .style('opacity', 0)
    .remove()

  // Labels in the foreground
  const svgSwimlaneLabels = g.selectAll<SVGGElement, CustomGraphSwimlane>(`.${s.swimlaneLabel}`)
    .data(swimlanes)

  const svgSwimlaneLabelsEnter = svgSwimlaneLabels.enter()
    .append('g')
    .attr('class', s.swimlaneLabel)
    .style('opacity', 0);

  // D3 types are not correct
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (svgSwimlaneLabelsEnter as any).transition()
    .style('opacity', 1)

  svgSwimlaneLabelsEnter
    .append('rect')
    .attr('class', s.swimlaneRect)

  svgSwimlaneLabelsEnter.append('rect')
    .attr('class', s.swimlaneLabelBackground)

  svgSwimlaneLabelsEnter.append('text')
    .attr('class', s.swimlaneLabelText);

  // D3 types are not correct
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (svgSwimlaneLabels.exit() as any)
    .transition()
    .style('opacity', 0)
    .remove()

  const svgSwimlaneLabelsMerged = svgSwimlaneLabels.merge(svgSwimlaneLabelsEnter)
  svgSwimlaneLabelsMerged.selectAll<SVGRectElement, CustomGraphSwimlane>(`.${s.swimlaneLabelBackground}`)
    .data(lane => [lane])
    .attr('y', '94.1%')
    .attr('height', '4%')
    .attr('rx', 8)
    .attr('ry', 8)
    .style('fill', lane => (lane.index) % 2 ? 'var(--unovis-background-primary)' : 'var(--unovis-background-secondary)')

  svgSwimlaneLabelsMerged.selectAll<SVGTextElement, CustomGraphSwimlane>(`.${s.swimlaneLabelText}`)
    .data(lane => [lane])
    .text(lane => lane.label)
    .attr('y', '97%')

  // Set the background size
  const labelPadding = 5
  svgSwimlaneLabelsMerged.each((_, i, nodes) => {
    const text = nodes[i].querySelector(`.${s.swimlaneLabelText}`) as SVGTextElement
    const label = nodes[i].querySelector(`.${s.swimlaneLabelBackground}`) as SVGRectElement
    const textBBox = text.getBBox()
    label.setAttribute('x', `${textBBox.x - labelPadding}`)
    label.setAttribute('width', `${textBBox.width + labelPadding * 2}`)
  })

  updateSwimlanes(g)
}

