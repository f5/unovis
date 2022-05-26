/* eslint-disable no-console */

import _ from 'lodash'
import { Component, ViewChild, ViewEncapsulation } from '@angular/core'
import { StyleSpecification } from 'maplibre-gl'
import { LeafletMap, LeafletMapConfigInterface, LeafletMapPoint, Position, Tooltip, TooltipConfigInterface } from '@volterra/vis'
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

  config: LeafletMapConfigInterface<MapPoint> = {
    style: lightTheme as StyleSpecification,
    styleDarkTheme: darkTheme as StyleSpecification,
    accessToken: '',
    valuesMap: {
      healthy: { color: '#47e845' },
      warning: { color: '#ffc226' },
      alert: { color: '#f8442d' },
      inactive: { color: '#acb2b9' },
      pending: { color: '#82affd', className: 'pointPending' },
      re: { color: '#4c7afc' },
      approving: { color: '#82affd' },
    },
    attribution: [
      '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
    ],
    pointBottomLabel: d => d.cluster ? `${d.point_count} sites` : d.id,
    pointCursor: 'crosshair',
    // selectedPointId: 'nc72965236',
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
