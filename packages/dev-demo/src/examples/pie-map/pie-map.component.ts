import clamp from 'lodash-es/clamp'
import mean from 'lodash-es/mean'
import sample from 'lodash-es/sample'
import { StyleSpecification } from 'maplibre-gl'
import { Component, ViewChild, ViewEncapsulation } from '@angular/core'
import { LeafletMap, LeafletMapConfigInterface, LeafletMapPointShape } from '@unovis/ts'
import { MapLeafletComponent } from '../../app/components/map-leaflet/map-leaflet.component'

// Configuration
import { darkTheme, lightTheme } from '../map/config'

// Data
import sites from './data/sites.json'

type SitePoint = {
  latitude: number;
  longitude: number;
  name: string;
  events: number;
  blocked: number;
  normal: number;
  pointShape: LeafletMapPointShape;
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
    pointShape: sample([LeafletMapPointShape.Circle, LeafletMapPointShape.Ring]),
  }))

  grandAvg = mean(this.data.map(d => d.events))

  config: LeafletMapConfigInterface<SitePoint> = {
    style: lightTheme as StyleSpecification,
    styleDarkTheme: darkTheme as StyleSpecification,
    pointRadius: d => {
      return clamp(7 + 10 * Math.sqrt((d.normal + (d.blocked || 0)) / this.grandAvg), 6, 25)
    },
    pointLabel: d => {
      return `${((d.blocked + d.normal) / 1000).toFixed(1)}K`
    },
    pointShape: d => d.pointShape,
    pointId: d => d.name,
    clusterRingWidth: 2,
    pointRingWidth: 5,
    clusterExpandOnClick: true,
    colorMap: {
      blocked: {
        color: '#f8442d',
      },
      normal: {
        color: '#4c7afc',
      },
    },
    pointBottomLabel: d => d.name,
    clusterBottomLabel: d => `${d.point_count} sites`,
    clusteringDistance: 65,
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
