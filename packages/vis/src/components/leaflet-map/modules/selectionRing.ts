import L from 'leaflet'

// Local Types
import { LeafletMapPoint } from 'components/leaflet-map/types'

// Utils
import { getPointPos } from './utils'

// Config
import { LeafletMapConfigInterface } from '../config'

import * as s from '../style'

export function createNodeSelectionRing (selection): void {
  selection.datum({ _zIndex: 3 })
  selection.append('path').attr('class', s.pointSelection)
}

export function updateNodeSelectionRing<D> (selection, selectedNode: LeafletMapPoint<D>, pointData: LeafletMapPoint<D>[], config: LeafletMapConfigInterface<D>, leafletMap: L.Map): void {
  selection.attr('class', s.pointSelectionRing)
  const pointSelection = selection.select(`.${s.pointSelection}`)
  if (selectedNode) {
    const foundNode = pointData.find(d => d.properties.id === selectedNode.properties.id)
    selection
      .attr('transform', d => {
        const { x, y } = getPointPos<D>(foundNode ?? selectedNode, leafletMap)
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
        return node?.color
      })
  } else {
    pointSelection.classed('active', false)
  }
}
