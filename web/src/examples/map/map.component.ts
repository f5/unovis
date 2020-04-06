// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import _ from 'lodash'
import { Component, AfterViewInit, ViewEncapsulation } from '@angular/core'
import { LeafletMapConfigInterface } from '@volterra/vis'
import earthquakes from './data/earthquakes100.geo.json'

type MapPoint = {
  id: string;
  longitude: number;
  latitude: number;
  status: string;
  shape: string;
}

function mapSampleData (): object[] {  
  return earthquakes.features.map(d => ({
      id: d.id,
      longitude: d.geometry.coordinates[0],
      latitude: d.geometry.coordinates[1],
      status: Math.random() < 0.4 ? _.sample(['healthy', 'warning', 'alert', 'inactive', 'pending', 're', 'approving']) : 'healthy',
      shape: Math.random() < 0.07 ? _.sample(['square', 'triangle']) : 'circle',
  }))
}

function getMapConfig (): LeafletMapConfigInterface<MapPoint> {
  return {
    renderer: 'tangram',
    // mapboxglGlyphs: 'https://maps.volterra.io/fonts/{fontstack}/{range}.pbf',
    sources: {
      // openmaptiles: {
      //   type: "vector",
      //   url: "https://maps.volterra.io/data/v3.json"
      // },
      mapzen: {
        max_zoom: 16,
        tile_size: 256,
        type: 'MVT',
        url: 'https://tile.nextzen.org/tilezen/vector/v1/256/all/{z}/{x}/{y}.mvt',
        url_params: {
          api_key: 'q-wBnCItTPC8Vdj8GA6g8Q'
        }
      }
    },
    accessToken: 'q-wBnCItTPC8Vdj8GA6g8Q',
    statusMap: {
      healthy: { color: '#47e845' },
      warning: { color: '#ffc226' },
      alert: { color: '#f8442d' },
      inactive: { color: '#acb2b9' },
      pending: { color: '#82affd', className: 'pointPending' },
      re: { color: '#4c7afc' },
      approving: { color: '#82affd' },
    },
    // selectedNodeId: 'nc72965236',
    initialBounds: { northEast: { lat: 77, lng: -172 }, southWest: { lat: -50, lng: 72 } },
    onMapMoveZoom: ({ mapCenter, zoomLevel, bounds }) => { /* console.log(mapCenter, zoomLevel, bounds) */ }
  }
}

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class MapComponent implements AfterViewInit {
  title = 'map'
  data = mapSampleData()
  config = getMapConfig()

  ngAfterViewInit (): void {
    // select node by id
    setTimeout(() => {
      this.config.selectedNodeId = _.sample(this.data).id
      this.config = { ...this.config } // Updating the object to trigger change detection
    }, 4000)

    // set new bounds
    setTimeout(() => {      
      this.config.bounds = { northEast: { lat: 77, lng: -172 }, southWest: { lat: -50, lng: 72 } }
      this.config = { ...this.config } // Updating the object to trigger change detection
    }, 8000)

    // update data
    setTimeout(() => {      
      this.data = mapSampleData()
    }, 12000)
  }
}
