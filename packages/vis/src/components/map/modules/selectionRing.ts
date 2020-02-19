// Copyright (c) Volterra, Inc. All rights reserved.
// Utils
import { find } from 'utils/data'
import { getPointPos } from './utils'

import * as s from '../style'

export function createNodeSelectionRing (selection): void {
  selection.datum({ _sortId: 3 })
  selection.append('path').attr('class', s.nodeSelection)
}

export function updateNodeSelectionRing (selection, selectedNode, pointData, config, leafletMap): void {
  selection.attr('class', s.nodeSelectionRing)
  const nodeSelection = selection.select(`.${s.nodeSelection}`)
  if (selectedNode) {
    const foundNode = find(pointData, d => d.properties.id === selectedNode.properties.id)
    selection
      .attr('transform', d => {
        const { x, y } = getPointPos(foundNode || selectedNode, leafletMap)
        return `translate(${x},${y})`
      })
      .classed(`${selectedNode.properties.shape}`, true)

    nodeSelection
      .classed('active', Boolean(foundNode))
      .attr('d', foundNode ? foundNode.path : null)
      .style('fill', 'transparent')
      .style('stroke-width', 1)
      .style('stroke', d => {
        const node = foundNode || selectedNode
        return node?.stroke || config.statusStyle?.[node.properties.status]?.color
      })
  } else {
    nodeSelection.classed('active', false)
  }
}
