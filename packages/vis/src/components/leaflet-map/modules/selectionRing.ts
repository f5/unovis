// Copyright (c) Volterra, Inc. All rights reserved.
import L from 'leaflet'

// Types
import { Point } from 'types/map'

// Utils
import { find } from 'utils/data'
import { getPointPos } from './utils'

// Config
import { LeafletMapConfigInterface } from '../config'

import * as s from '../style'

export function createNodeSelectionRing (selection): void {
  selection.datum({ _zIndex: 3 })
  selection.append('path').attr('class', s.pointSelection)
}

export function updateNodeSelectionRing<T> (selection, selectedNode: Point, pointData: Point[], config: LeafletMapConfigInterface<T>, leafletMap: L.Map): void {
  selection.attr('class', s.pointSelectionRing)
  const pointSelection = selection.select(`.${s.pointSelection}`)
  if (selectedNode) {
    const foundNode = find(pointData, d => d.properties.id === selectedNode.properties.id)
    selection
      .attr('transform', d => {
        const { x, y } = getPointPos(foundNode || selectedNode, leafletMap)
        return `translate(${x},${y})`
      })
      .classed(`${selectedNode.properties.shape}`, true)

    pointSelection
      .classed('active', Boolean(foundNode))
      .attr('d', foundNode ? foundNode.path : null)
      .style('fill', 'transparent')
      .style('stroke-width', 1)
      .style('stroke', d => {
        const node = foundNode || selectedNode
        return node?.stroke || config.statusMap?.[node.properties.status]?.color
      })
  } else {
    pointSelection.classed('active', false)
  }
}
