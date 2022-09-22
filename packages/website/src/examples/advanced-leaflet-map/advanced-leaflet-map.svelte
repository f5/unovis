<script lang="ts">
  import { VisLeafletMap } from '@unovis/svelte'
  import { LeafletMap, LeafletMapClusterDatum } from '@unovis/ts'

  // Data
  import { MapPointDataRecord, data, totalEvents, mapStyleLight, mapStyleDark } from './data'

  let map: VisLeafletMap | undefined

  const style = mapStyleLight
  const styleDarkTheme = mapStyleDark
  const pointId = (d: MapPointDataRecord): string => d.name
  const pointLatitude = (d: MapPointDataRecord): number => d.latitude
  const pointLongitude = (d: MapPointDataRecord): number => d.longitude
  const pointBottomLabel = (d: MapPointDataRecord): string => d.name
  const pointRadius = (d: MapPointDataRecord | LeafletMapClusterDatum<MapPointDataRecord>): number => 10 + 4 * Math.sqrt((d.normal + (d.blocked || 0)) / totalEvents)
  const pointLabel = (d: MapPointDataRecord | LeafletMapClusterDatum<MapPointDataRecord>): string => `${((d.blocked + d.normal) / 1000).toFixed(1)}K`
  const clusterBottomLabel = (d: LeafletMapClusterDatum<MapPointDataRecord>): string => `${d.point_count} sites`
  const clusteringDistance = 85
  const clusterExpandOnClick = true

  const colorMap = { // Object keys ('normal', 'blocked') correspond to property names in MapPointDataRecor
    normal: { color: '#4c7afc' },
    blocked: { color: '#f8442d' },
  }

  const events = {
    [LeafletMap.selectors.point]: {
      click: d => {
        if (!d.properties?.cluster) map?.getComponent().zoomToPointById(d.id, true, 5)
      },
    },
    [LeafletMap.selectors.background]: {
      click: () => { map?.getComponent().unselectPoint() },
    },
  }

  const attribution = [
    '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
  ]
</script>


<VisLeafletMap
  bind:this={map}
  height="50vh"
  {data}
  {style}
  {styleDarkTheme}
  {pointId}
  {pointLatitude}
  {pointLongitude}
  {pointBottomLabel}
  {pointRadius}
  {pointLabel}
  {colorMap}
  {clusterBottomLabel}
  clusterRadius={pointRadius}
  clusterLabel={pointLabel}
  clusteringDistance="85"
  clusterExpandOnClick={true}
  {events}
  {attribution}
/>



