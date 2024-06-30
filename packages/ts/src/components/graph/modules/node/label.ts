import { select, Selection } from 'd3-selection'
import { Transition } from 'd3-transition'

import type { GraphNode } from 'components/graph/types'
import type { GraphInputLink, GraphInputNode } from 'types/graph'

import * as nodeSelectors from './style'

export function createLabel<N extends GraphInputNode, L extends GraphInputLink> (
  g: Selection<SVGGElement, GraphNode<N, L>, null, unknown>
): Selection<SVGGElement, GraphNode<N, L>, null, unknown> {
  // Label
  const label = g.append('g').attr('class', nodeSelectors.label)

  // Label background rect
  label.append('rect').attr('class', nodeSelectors.labelBackground)

  // Label text
  const labelText = label.append('text')
    .attr('class', nodeSelectors.labelText)
    .attr('dy', '0.32em')

  labelText.append('tspan').attr('class', nodeSelectors.labelTextContent)

  labelText.append('tspan')
    .attr('class', nodeSelectors.subLabelTextContent)
    .attr('dy', '1.1em')
    .attr('x', '0')

  return label
}
