import type L from 'leaflet'
import { Selection } from 'd3-selection'

// Types
import { GenericDataRecord } from 'types/data'

// Utils
import { getString } from 'utils/data'
import { getPointPos } from './utils'

// Local Types
import { LeafletMapPoint, LeafletMapPointDatum } from '../types'

// Config
import { LeafletMapConfigInterface } from '../config'

import * as s from '../style'


export function createNodeSelectionRing (
  selection: Selection<SVGGElement, unknown, SVGElement, undefined>
): void {
  selection.datum({ _zIndex: 3 })
  selection.append('path').attr('class', s.pointSelection)
}

export function updateNodeSelectionRing<D extends GenericDataRecord> (
  selection: Selection<SVGGElement, unknown, SVGElement, undefined>,
  selectedPoint: LeafletMapPoint<D>,
  pointData: LeafletMapPoint<D>[],
  config: LeafletMapConfigInterface<D>,
  leafletMap: L.Map
): void {
  selection.attr('class', s.pointSelectionRing)
  const pointSelection = selection.select(`.${s.pointSelection}`)
  if (selectedPoint) {
    const isCluster = selectedPoint.isCluster
    const selectedPointId: string | undefined = getString(selectedPoint.properties as LeafletMapPointDatum<D>, config.pointId)
    const foundPoint = pointData.find(d =>
      isCluster
        ? (d.id === selectedPoint.id)
        : (selectedPointId && (getString(d.properties as LeafletMapPointDatum<D>, config.pointId) === selectedPointId))
    )
    selection
      .attr('transform', d => {
        const { x, y } = getPointPos<D>(foundPoint ?? selectedPoint, leafletMap)
        return `translate(${x},${y})`
      })
      .classed(`${(selectedPoint.properties as LeafletMapPointDatum<D>).shape}`, true)

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
