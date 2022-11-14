/* eslint-disable no-console */
import _ from 'lodash'
import { Component, ViewChild, ViewEncapsulation } from '@angular/core'
import { LeafletMap, LeafletMapConfigInterface, LeafletMapPoint, LeafletMapRenderer, Position, Tooltip, TooltipConfigInterface } from '@unovis/ts'
import { StyleSpecification } from 'maplibre-gl'
import { MapLeafletComponent } from '../../app/components/map-leaflet/map-leaflet.component'

// Configuration
import { lightTheme, darkTheme } from './config'

// Data
import earthquakes from './data/earthquakes100.geo.json'

type MapPoint = {
  id: string;
  longitude: number;
  latitude: number;
  shape: string;

  healthy?: number;
  warning?: number;
  alert?: number;
  inactive?: number;
  pending?: number;
  re?: number;
  approving?: number;
}

function mapSampleData (): Record<string, any>[] {
  return earthquakes.features.map(d => {
    const status = Math.random() < 0.4 ? _.sample(['healthy', 'warning', 'alert', 'inactive', 'pending', 're', 'approving']) : 'healthy'

    return {
      id: d.id,
      longitude: d.geometry.coordinates[0],
      latitude: d.geometry.coordinates[1],
      shape: Math.random() < 0.07 ? _.sample(['square', 'triangle']) : 'circle',
      [status]: 1,
    }
  })
}

function getTooltipConfig (): TooltipConfigInterface {
  return {
    verticalPlacement: Position.Center,
    horizontalShift: 10,
    triggers: {
      [LeafletMap.selectors.point]: (d: LeafletMapPoint<MapPoint>) => `<div>${d.id}</div>`,
    },
  }
}

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MapComponent {
  @ViewChild('mapContainer', { static: false }) mapContainer: MapLeafletComponent<MapPoint>

  title = 'map'
  data = mapSampleData()
  renderer = LeafletMapRenderer.Raster
  urls = [
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
    'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  ]

  config: LeafletMapConfigInterface<MapPoint> = {
    style: this.renderer === LeafletMapRenderer.Raster ? this.urls[0] : lightTheme as StyleSpecification,
    styleDarkTheme: this.renderer === LeafletMapRenderer.Raster ? this.urls[1] : darkTheme as StyleSpecification,
    accessToken: '',
    colorMap: {
      healthy: { color: '#47e845' },
      warning: { color: '#ffc226' },
      alert: { color: '#f8442d' },
      inactive: { color: '#acb2b9' },
      pending: { color: '#82affd', className: 'pointPending' },
      re: { color: '#4c7afc' },
      approving: { color: '#82affd' },
    },
    renderer: this.renderer,
    attribution: [
      '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
    ],
    pointBottomLabel: d => d.id,
    clusterBottomLabel: d => `${d.point_count} sites`,
    pointCursor: 'crosshair',
    selectedPointId: 'nc72965236',
    initialBounds: { northEast: { lat: 77, lng: -172 }, southWest: { lat: -50, lng: 72 } },
    onMapMoveZoom: ({ mapCenter, zoomLevel, bounds }) => { /* console.log(mapCenter, zoomLevel, bounds) */ },
    onMapMoveStart: ({ mapCenter, zoomLevel, bounds, userDriven }) => { console.log('onMapMoveStart', mapCenter, zoomLevel, bounds, userDriven) },
    onMapMoveEnd: ({ mapCenter, zoomLevel, bounds, userDriven }) => { console.log('onMapMoveEnd', mapCenter, zoomLevel, bounds, userDriven) },
    onMapZoomStart: ({ mapCenter, zoomLevel, bounds, userDriven }) => { console.log('onMapZoomStart', mapCenter, zoomLevel, bounds, userDriven) },
    onMapZoomEnd: ({ mapCenter, zoomLevel, bounds, userDriven }) => { console.log('onMapZoomEnd', mapCenter, zoomLevel, bounds, userDriven) },
    onMapClick: ({ mapCenter, zoomLevel, bounds, userDriven }) => {
      console.log('onMapClick', mapCenter, zoomLevel, bounds, userDriven)
      this.mapContainer?.map.unselectPoint()
    },
    tooltip: new Tooltip(getTooltipConfig()),
    events: {
      [LeafletMap.selectors.point]: {
        click: d => {
          if (!d.properties?.cluster) this.mapContainer?.map.zoomToPointById(d.id, true)
        },
      },
    },
  }
}
