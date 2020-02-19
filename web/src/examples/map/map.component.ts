// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import _ from 'lodash'
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core'
import { LeafletMap, LeafletMapConfigInterface } from '@volterra/vis/components'
import earthquakes from './data/earthquakes100.geo.json'

type MapPoint = {
  id: string;
  longitude: number;
  latitude: number;
  status: string;
  shape: string;
}

function generateData (): object[] {  
  return earthquakes.features.map(d => ({
      id: d.id,
      longitude: d.geometry.coordinates[0],
      latitude: d.geometry.coordinates[1],
      status: Math.random() < 0.4 ? _.sample(['healthy', 'warning', 'alert', 'inactive', 'pending', 're', 'approving']) : 'healthy',
      shape: Math.random() < 0.07 ? _.sample(['square', 'triangle']) : 'circle',
  }))
}

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class MapComponent implements OnInit, AfterViewInit {
  title = 'map'
  map = null
  data: any
  config: any
  mapChartConfig: any
  @ViewChild('map', { static: false }) mapRef: ElementRef

  ngAfterViewInit (): void {
    this.config = getMapConfig()
    this.map = new LeafletMap(this.mapRef.nativeElement, this.config, this.data)

    // setBounds
    // selectNode
    // zoomToNode
  }

  ngOnInit (): void {
    this.data = generateData()
  }
}

function getMapConfig (): LeafletMapConfigInterface<MapPoint> {
  return {
    renderer: 'mapboxgl',
    mapboxglGlyphs: 'https://maps.volterra.io/fonts/{fontstack}/{range}.pbf',
    sources: {
      openmaptiles: {
        type: "vector",
        url: "https://maps.volterra.io/data/v3.json"
      }
    },
    // accessToken: 'q-wBnCItTPC8Vdj8GA6g8Q',
    statusMap: {
      healthy: { color: '#47e845' },
      warning: { color: '#ffc226' },
      alert: { color: '#f8442d' },
      inactive: { color: '#acb2b9' },
      pending: { color: '#82affd', className: 'pointPending' },
      re: { color: '#4c7afc' },
      approving: { color: '#82affd' },
    },
    initialBounds: { northEast: { lat: 77, lng: -172 }, southWest: { lat: -50, lng: 72 } },
    onMapMoveZoom: ({ mapCenter, zoomLevel, bounds }) => { console.log(mapCenter, zoomLevel, bounds)}
  }
}
