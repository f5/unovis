// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import _ from 'lodash'
import { Component, AfterViewInit, ViewEncapsulation, ViewChild } from '@angular/core'
import { LeafletMap, LeafletMapConfigInterface, TooltipConfigInterface, Tooltip, Position } from '@volterra/vis'
import { MapLeafletComponent } from '../../app/components/map-leaflet/map-leaflet.component'

// Data
import earthquakes from './data/earthquakes100.geo.json'

type MapPoint = {
  id: string;
  longitude: number;
  latitude: number;
  shape: string;

  healthy?: number,
  warning?: number,
  alert?: number,
  inactive?: number,
  pending?: number,
  re?: number,
  approving?: number,
}

function mapSampleData (): object[] {
  return earthquakes.features.map(d => {
    const status = Math.random() < 0.4 ? _.sample(['healthy', 'warning', 'alert', 'inactive', 'pending', 're', 'approving']) : 'healthy';

    return {
      id: d.id,
      longitude: d.geometry.coordinates[0],
      latitude: d.geometry.coordinates[1],
      shape: Math.random() < 0.07 ? _.sample(['square', 'triangle']) : 'circle',
      // healthy: 0,
      // warning: 0,
      // alert: 0,
      // inactive: 0,
      // pending: 0,
      // re: 0,
      // approving: 0,
      [status]: 1,
    }
  })
}

function getTooltipConfig (): TooltipConfigInterface<LeafletMap<MapPoint>, MapPoint> {
  return {
    verticalPlacement: Position.CENTER,
    horizontalShift: 10,
    triggers: {
      [LeafletMap.selectors.point]: d => `<div>${d.id}</div>`
    }
  }
};

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class MapComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer: MapLeafletComponent<MapPoint>

  title = 'map'
  data = mapSampleData()
  config: LeafletMapConfigInterface<MapPoint> = {
    renderer: 'mapboxgl',
    mapboxglGlyphs: 'https://maps.volterra.io/fonts/{fontstack}/{range}.pbf',
    sources: {
      openmaptiles: {
        type: "vector",
        url: "https://maps.volterra.io/data/v3.json"
      },
      // mapzen: {
      //   max_zoom: 16,
      //   tile_size: 256,
      //   type: 'MVT',
      //   url: 'https://tile.nextzen.org/tilezen/vector/v1/256/all/{z}/{x}/{y}.mvt',
      //   url_params: {
      //     api_key: ''
      //   }
      // }
    },
    // accessToken: '',
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
      '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>'
    ],
    pointBottomLabel: d => d.cluster ? `${d.point_count} sites` : d.id,
    // selectedNodeId: 'nc72965236',
    initialBounds: { northEast: { lat: 77, lng: -172 }, southWest: { lat: -50, lng: 72 } },
    onMapMoveZoom: ({ mapCenter, zoomLevel, bounds }) => { /* console.log(mapCenter, zoomLevel, bounds) */ },
    onMapMoveStart: ({ mapCenter, zoomLevel, bounds, userDriven }) => { console.log('onMapMoveStart', mapCenter, zoomLevel, bounds, userDriven) },
    onMapMoveEnd: ({ mapCenter, zoomLevel, bounds, userDriven }) => { console.log('onMapMoveEnd', mapCenter, zoomLevel, bounds, userDriven) },
    onMapZoomStart: ({ mapCenter, zoomLevel, bounds, userDriven }) => { console.log('onMapZoomStart', mapCenter, zoomLevel, bounds, userDriven) },
    onMapZoomEnd: ({ mapCenter, zoomLevel, bounds, userDriven }) => { console.log('onMapZoomEnd', mapCenter, zoomLevel, bounds, userDriven) },
    tooltip: new Tooltip<LeafletMap<MapPoint>, MapPoint>(getTooltipConfig()),
    events: {
      [LeafletMap.selectors.point]: {
        click: d => { !d.properties?.cluster && this.mapContainer?.map.zoomToPointById(d.id, true) },
      },
      [LeafletMap.selectors.background]: {
        click: () => { this.mapContainer?.map.unselectPoint() },
      }
    }
  }

  ngAfterViewInit (): void {
    // select node by id
    // setTimeout(() => {
    //   this.config.selectedNodeId = _.sample(this.data).id
    //   this.config = { ...this.config } // Updating the object to trigger change detection
    // }, 4000)

    // // set new bounds
    // setTimeout(() => {
    //   this.config.bounds = { northEast: { lat: 77, lng: -172 }, southWest: { lat: -50, lng: 72 } }
    //   this.config = { ...this.config } // Updating the object to trigger change detection
    // }, 8000)

    // // update data
    // setTimeout(() => {
    //   this.data = mapSampleData()
    // }, 12000)
  }
}
