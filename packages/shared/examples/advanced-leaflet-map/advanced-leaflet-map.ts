import { LeafletMap, LeafletMapConfigInterface, LeafletMapClusterDatum } from '@unovis/ts'

// Data
import { MapPointDataRecord, data, totalEvents, mapStyleLight, mapStyleDark } from './data'

// eslint-disable-next-line no-undef-init
let map: LeafletMap<MapPointDataRecord> | undefined = undefined
const container = document.getElementById('vis-container')

const pointRadius = (d: MapPointDataRecord | LeafletMapClusterDatum<MapPointDataRecord>): number => 10 + 4 * Math.sqrt((d.normal + (d.blocked || 0)) / totalEvents)
const pointLabel = (d: MapPointDataRecord | LeafletMapClusterDatum<MapPointDataRecord>): string => `${((d.blocked + d.normal) / 1000).toFixed(1)}K`

const config: LeafletMapConfigInterface<MapPointDataRecord> = {
  style: mapStyleLight,
  styleDarkTheme: mapStyleDark,
  pointId: (d: MapPointDataRecord): string => d.name,
  pointLatitude: (d: MapPointDataRecord): number => d.latitude,
  pointLongitude: (d: MapPointDataRecord): number => d.longitude,
  pointBottomLabel: (d: MapPointDataRecord): string => d.name,
  pointRadius,
  pointLabel,
  clusterBottomLabel: (d: LeafletMapClusterDatum<MapPointDataRecord>): string => `${d.point_count} sites`,
  clusterRadius: pointRadius,
  clusterLabel: pointLabel,
  colorMap: { // Object keys ('normal', 'blocked') correspond to property names in MapPointDataRecord
    normal: { color: '#4c7afc' },
    blocked: { color: '#f8442d' },
  },
  events: {
    [LeafletMap.selectors.point]: {
      click: d => {
        if (!d.properties?.cluster) map?.zoomToPointById(d.id, true, 5)
      },
    },
    [LeafletMap.selectors.background]: {
      click: () => { map?.unselectPoint() },
    },
  },
  clusteringDistance: 85,
  clusterExpandOnClick: true,
  attribution: [
    '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
  ],
}

map = new LeafletMap(container, config, data)
