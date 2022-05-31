import L from 'leaflet'
import { Selection } from 'd3-selection'

// Local Types
import { LeafletMapPoint } from 'components/leaflet-map/types'

// Utils
import { getString } from 'utils/data'
import { getPointPos } from './utils'

// Config
import { LeafletMapConfigInterface } from '../config'

import * as s from '../style'

export function createNodeSelectionRing (selection: Selection<SVGGElement, Record<string, unknown>[], SVGElement, Record<string, unknown>[]>): void {
  selection.datum({ _zIndex: 3 })
  selection.append('path').attr('class', s.pointSelection)
}

export function updateNodeSelectionRing<D> (
  selection: Selection<SVGGElement, Record<string, unknown>[], SVGElement, Record<string, unknown>[]>,
  selectedPoint: LeafletMapPoint<D>,
  pointData: LeafletMapPoint<D>[],
  config: LeafletMapConfigInterface<D>,
  leafletMap: L.Map
): void {
  selection.attr('class', s.pointSelectionRing)
  const pointSelection = selection.select(`.${s.pointSelection}`)
  if (selectedPoint) {
    const isCluster = selectedPoint.isCluster
    const selectedPointId: string | undefined = getString(selectedPoint.properties, config.pointId)
    const foundPoint = pointData.find(d =>
      isCluster
        ? (d.id === selectedPoint.id)
        : (selectedPointId && (getString(d.properties, config.pointId) === selectedPointId))
    )
    selection
      .attr('transform', d => {
        const { x, y } = getPointPos<D>(foundPoint ?? selectedPoint, leafletMap)
        return `translate(${x},${y})`
      })
      .classed(`${selectedPoint.properties.shape}`, true)

    pointSelection
      .classed('active', Boolean(foundPoint))
      .attr('d', foundPoint ? foundPoint.path : null)
      .style('fill', 'transparent')
      .style('stroke-width', 1)
      .style('stroke', d => {
        const node = foundPoint || selectedPoint
        return node?.color
      })
  } else {
    pointSelection.classed('active', false)
  }
}
