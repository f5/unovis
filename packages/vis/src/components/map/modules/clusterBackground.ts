// Copyright (c) Volterra, Inc. All rights reserved.

// Utils
import { cloneDeep } from 'utils/data'

// Types
import { PointShape } from 'types/map'

export function createBackgroundNode (selection): void {
  selection.datum({ _sortId: 1 })
  selection.append('path')
}

export function updateBackgroundNode (selection, datamodel, config, clusterBackgroundRadius): void {
  const { clusterBackground } = config
  if (datamodel.expandedCluster && clusterBackground) {
    const node = cloneDeep(datamodel.expandedCluster.cluster)
    const { x, y } = datamodel.getPointPos(node)
    const path = datamodel.getNodePathData({ x: 0, y: 0 }, clusterBackgroundRadius, PointShape.CIRCLE)
    selection.select('path').attr('d', d => path)
    selection
      .classed('active', true)
      .attr('transform', `translate(${x},${y})`)
  } else {
    selection.classed('active', false)
  }
}
