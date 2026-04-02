import { Selection } from 'd3-selection'
import { GeoProjection } from 'd3-geo'

// Types
import { getString } from 'utils/data'
import { TopoJSONMapPoint } from '../types'
import { TopoJSONMapConfigInterface } from '../config'

// Styles
import * as s from '../style'

export function updateSelectionRing<AreaDatum, PointDatum, LinkDatum> (
  pointSelectionRing: Selection<SVGGElement, unknown, null, undefined>,
  selectedPoint: TopoJSONMapPoint<PointDatum> | null,
  pointData: TopoJSONMapPoint<PointDatum>[],
  config: TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>,
  projection: GeoProjection,
  currentZoomLevel: number
): void {
  const pointSelection = pointSelectionRing.select<SVGPathElement>(`.${s.pointSelection}`)

  if (selectedPoint) {
    const selectedPointId = getString(selectedPoint.properties as PointDatum, config.pointId)
    type PointWithOffset = TopoJSONMapPoint<PointDatum> & { dx?: number; dy?: number }

    const foundPoint = pointData.find(d =>
      selectedPoint.isCluster
        ? (d.id === selectedPoint.id)
        : (selectedPointId && getString(d.properties as PointDatum, config.pointId) === selectedPointId)
    ) as PointWithOffset | undefined

    const pos = projection((foundPoint ?? selectedPoint).geometry.coordinates as [number, number])
    if (pos) {
      const dx = (foundPoint?.dx ?? 0) / currentZoomLevel
      const dy = (foundPoint?.dy ?? 0) / currentZoomLevel
      pointSelectionRing.attr('transform', `translate(${pos[0] + dx},${pos[1] + dy})`)
    }

    pointSelection
      .classed('active', Boolean(foundPoint))
      .attr('d', foundPoint?.path || null)
      .style('fill', 'transparent')
      .style('stroke-width', 1)
      .style('stroke', (foundPoint || selectedPoint)?.color)
      .style('transform', `scale(${1.25 / currentZoomLevel})`)
  } else {
    pointSelection.classed('active', false)
  }
}

