import { Component, ViewChild } from '@angular/core'
import { LeafletMap, LeafletMapClusterDatum } from '@unovis/ts'
import { VisLeafletMapComponent } from '@unovis/angular'

// Data
import { MapPointDataRecord, data, totalEvents, mapStyleLight, mapStyleDark } from './data'

@Component({
  selector: 'advanced-leaflet-map',
  templateUrl: './advanced-leaflet-map.component.html',
})
export class AdvancedLeafletMapComponent {
  @ViewChild('mapContainer', { static: false }) mapContainer: VisLeafletMapComponent<MapPointDataRecord>

  data = data
  style = mapStyleLight
  styleDarkTheme = mapStyleDark
  pointId = (d: MapPointDataRecord): string => d.name
  pointLatitude = (d: MapPointDataRecord): number => d.latitude
  pointLongitude = (d: MapPointDataRecord): number => d.longitude
  pointBottomLabel = (d: MapPointDataRecord): string => d.name
  pointRadius = (d: MapPointDataRecord | LeafletMapClusterDatum<MapPointDataRecord>): number => 10 + 4 * Math.sqrt((d.normal + (d.blocked || 0)) / totalEvents)
  pointLabel = (d: MapPointDataRecord | LeafletMapClusterDatum<MapPointDataRecord>): string => `${((d.blocked + d.normal) / 1000).toFixed(1)}K`
  clusterBottomLabel = (d: LeafletMapClusterDatum<MapPointDataRecord>): string => `${d.point_count} sites`
  clusteringDistance = 85
  clusterExpandOnClick = true

  colorMap = { // Object keys ('normal', 'blocked') correspond to property names in MapPointDataRecor
    normal: { color: '#4c7afc' },
    blocked: { color: '#f8442d' },
  }

  events = {
    [LeafletMap.selectors.point]: {
      click: d => {
        if (!d.properties?.cluster) this.mapContainer?.component.zoomToPointById(d.id, true, 5)
      },
    },
    [LeafletMap.selectors.background]: {
      click: () => { this.mapContainer?.component.unselectPoint() },
    },
  }

  attribution = [
    '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
  ]
}
