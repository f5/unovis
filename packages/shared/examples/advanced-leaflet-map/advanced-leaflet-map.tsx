import React, { useCallback, useMemo, useRef } from 'react'
import { LeafletMap, LeafletMapClusterDatum } from '@unovis/ts'
import { VisLeafletMap, VisLeafletMapRef } from '@unovis/react'

// Data
import { MapPointDataRecord, data, totalEvents, mapStyleLight, mapStyleDark } from './data'

export default function AdvancedLeafletMap (): JSX.Element {
  const mapRef = useRef<VisLeafletMapRef<MapPointDataRecord>>(null)
  const pointId = (d: MapPointDataRecord): string => d.name
  const pointLatitude = (d: MapPointDataRecord): number => d.latitude
  const pointLongitude = (d: MapPointDataRecord): number => d.longitude
  const pointBottomLabel = (d: MapPointDataRecord): string => d.name
  const pointRadius = (d: MapPointDataRecord | LeafletMapClusterDatum<MapPointDataRecord>): number => 10 + 4 * Math.sqrt((d.normal + (d.blocked || 0)) / totalEvents)
  const pointLabel = (d: MapPointDataRecord | LeafletMapClusterDatum<MapPointDataRecord>): string => `${((d.blocked + d.normal) / 1000).toFixed(1)}K`
  const clusterBottomLabel = (d: LeafletMapClusterDatum<MapPointDataRecord>): string => `${d.point_count} sites`

  const colorMap = { // Object keys ('normal', 'blocked') correspond to property names in MapPointDataRecord
    normal: { color: '#4c7afc' },
    blocked: { color: '#f8442d' },
  }

  const events = {
    [LeafletMap.selectors.point]: {
      click: d => {
        if (!d.properties?.cluster) mapRef.current?.component.zoomToPointById(d.id, true, 5)
      },
    },
    [LeafletMap.selectors.background]: {
      click: () => { mapRef.current?.component.unselectPoint() },
    },
  }

  const attribution = [
    '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
  ]

  return (
    <VisLeafletMap
      ref={mapRef}
      data={data}
      style={mapStyleLight}
      styleDarkTheme={mapStyleDark}
      pointId={useCallback(pointId, [])}
      pointLatitude={useCallback(pointLatitude, [])}
      pointLongitude={useCallback(pointLongitude, [])}
      pointLabel={useCallback(pointLabel, [])}
      pointBottomLabel={useCallback(pointBottomLabel, [])}
      pointRadius={useCallback(pointRadius, [])}
      colorMap={useMemo(() => colorMap, [])}
      clusterRadius={useCallback(pointRadius, [])}
      clusterLabel={useCallback(pointLabel, [])}
      clusterBottomLabel={useCallback(clusterBottomLabel, [])}
      clusteringDistance={85}
      clusterExpandOnClick={true}
      attribution={useMemo(() => attribution, [])}
      events={useMemo(() => events, [])}
    />
  )
}
