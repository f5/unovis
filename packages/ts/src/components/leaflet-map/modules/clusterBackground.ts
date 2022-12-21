import type L from 'leaflet'

// Types
import { GenericDataRecord } from 'types/data'

// Utils
import { cloneDeep } from 'utils/data'
import { getPointPos, getNodePathData } from './utils'

// Local Types
import { LeafletMapPointShape } from '../types'

// Config Interface
import { LeafletMapConfigInterface } from '../config'

export function createBackgroundNode (selection): void {
  selection.datum({ _zIndex: 1 })
  selection.append('path')
}

export function updateBackgroundNode<T extends GenericDataRecord> (selection, expandedCluster, config: LeafletMapConfigInterface<T>, leafletMap: L.Map, clusterBackgroundRadius): void {
  const { clusterBackground } = config
  if (expandedCluster && clusterBackground) {
    const node = cloneDeep(expandedCluster.cluster)
    const { x, y } = getPointPos(node, leafletMap)
    const path = getNodePathData({ x: 0, y: 0 }, clusterBackgroundRadius, LeafletMapPointShape.Circle)
    selection.select('path').attr('d', d => path)
    selection
      .classed('active', true)
      .attr('transform', `translate(${x},${y})`)
  } else {
    selection.classed('active', false)
  }
}
