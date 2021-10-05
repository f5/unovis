// Copyright (c) Volterra, Inc. All rights reserved.
import clamp from 'lodash/clamp'
import mean from 'lodash/mean'
import { Style } from 'maplibre-gl'
import { Component, ViewEncapsulation, ViewChild } from '@angular/core'
import { LeafletMap, LeafletMapConfigInterface, LeafletMapRenderer } from '@volterra/vis'
import { MapLeafletComponent } from '../../app/components/map-leaflet/map-leaflet.component'

// Configuration
import tilesConfig from '../map/tiles-config.json'

// Data
import sites from './data/sites.json'

type SitePoint = {
  latitude: number;
  longitude: number;
  name: string;
  events: number;
  blocked: number;
  normal: number;
}

@Component({
  selector: 'pie-map',
  templateUrl: './pie-map.component.html',
  styleUrls: ['./pie-map.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class PieMapComponent {
  @ViewChild('mapContainer', { static: false }) mapContainer: MapLeafletComponent<SitePoint>

  title = 'map'
  data = sites.map(d => ({
    ...d,
    normal: d.events - d.blocked,
  }))

  grandAvg = mean(this.data.map(d => d.events))

  config: LeafletMapConfigInterface<SitePoint> = {
    renderer: LeafletMapRenderer.MapLibreGL,
    rendererSettings: tilesConfig as Style,
    pointRadius: d => {
      return clamp(7 + 10 * Math.sqrt((d.normal + d.blocked) / this.grandAvg), 6, 25)
    },
    pointLabel: d => {
      return `${((d.blocked + d.normal) / 1000).toFixed(1)}K`
    },
    pointId: d => d.name,
    clusterOutlineWidth: 2,
    clusterExpandOnClick: true,
    valuesMap: {
      blocked: {
        color: '#f8442d',
      },
      normal: {
        color: '#4c7afc',
      },
    },
    pointBottomLabel: d => d.cluster ? `${d.point_count} sites` : d.name,
    clusterRadius: 65,
    attribution: [
      '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
    ],
    events: {
      [LeafletMap.selectors.point]: {
        click: d => {
          if (d.properties?.cluster) this.mapContainer?.map.zoomToPointById(d.id, true)
        },
      },
      [LeafletMap.selectors.background]: {
        click: () => { this.mapContainer?.map.unselectPoint() },
      },
    },
  }
}
