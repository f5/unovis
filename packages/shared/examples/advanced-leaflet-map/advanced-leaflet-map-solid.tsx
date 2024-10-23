import { createMemo, createSignal, JSX } from 'solid-js'
import { LeafletMap } from '@unovis/ts'
import type { LeafletMapClusterDatum } from '@unovis/ts'
import { VisLeafletMap } from '@unovis/solid'

// Data
import { MapPointDataRecord, data, totalEvents, mapStyleLight, mapStyleDark } from './data'

const AdvancedLeafletMap = (): JSX.Element => {
  const [map, setMap] = createSignal<LeafletMap<MapPointDataRecord>>()

  const style = mapStyleLight
  const styleDarkTheme = mapStyleDark
  const pointId = (d: MapPointDataRecord): string => d.name
  const pointLatitude = (d: MapPointDataRecord): number => d.latitude
  const pointLongitude = (d: MapPointDataRecord): number => d.longitude
  const pointBottomLabel = (d: MapPointDataRecord): string => d.name
  const pointRadius = (
    d: MapPointDataRecord | LeafletMapClusterDatum<MapPointDataRecord>
  ): number => 10 + 4 * Math.sqrt((d.normal + (d.blocked || 0)) / totalEvents)
  const pointLabel = (
    d: MapPointDataRecord | LeafletMapClusterDatum<MapPointDataRecord>
  ): string => `${((d.blocked + d.normal) / 1000).toFixed(1)}K`
  const clusterBottomLabel = (
    d: LeafletMapClusterDatum<MapPointDataRecord>
  ): string => `${d.point_count} sites`
  const clusteringDistance = 85
  const clusterExpandOnClick = true

  const colorMap = {
    // Object keys ('normal', 'blocked') correspond to property names in MapPointDataRecor
    normal: { color: '#4c7afc' },
    blocked: { color: '#f8442d' },
  }

  const events = createMemo(() => ({
    [LeafletMap.selectors.point]: {
      click: (d) => {
        if (!d.properties?.cluster) map()?.zoomToPointById(d.id, true, 5)
      },
    },
    [LeafletMap.selectors.background]: {
      click: () => {
        map()?.unselectPoint()
      },
    },
  }))

  const attribution = [
    '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
  ]

  return (
    <VisLeafletMap
      ref={setMap}
      height='50dvh'
      data={data}
      style={style}
      styleDarkTheme={styleDarkTheme}
      pointId={pointId}
      pointLatitude={pointLatitude}
      pointLongitude={pointLongitude}
      pointBottomLabel={pointBottomLabel}
      pointRadius={pointRadius}
      pointLabel={pointLabel}
      colorMap={colorMap}
      clusterBottomLabel={clusterBottomLabel}
      clusteringDistance={clusteringDistance}
      clusterExpandOnClick={clusterExpandOnClick}
      events={events()}
      attribution={attribution}
      clusterRadius={pointRadius}
      clusterLabel={pointLabel}
    />
  )
}

export default AdvancedLeafletMap
