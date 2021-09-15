// Copyright (c) Volterra, Inc. All rights reserved.
import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core'
import flatten from 'lodash/flatten'
import {
  LeafletFlowMap,
  LeafletFlowMapConfigInterface,
  LeafletMapRenderer,
  MapLibreArcticLight,
  Position,
  PositionStrategy,
  Tooltip,
} from '@volterra/vis'
import { MapLeafletComponent } from '../../app/components/map-leaflet/map-leaflet.component'

// Data
import sites from './data/sites.json'

type SitePoint = {
  latitude: number;
  longitude: number;
  name: string;
  events: number;
  danger: number;
  normal: number;
}

type DDoSFlow = {
  from: [number, number];
  to: [number, number];
  value: number;
}

@Component({
  selector: 'ddos-map',
  templateUrl: './ddos-map.component.html',
  styleUrls: ['./ddos-map.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class DDoSMapComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer: MapLeafletComponent<SitePoint, DDoSFlow>

  title = 'DDoS Map'

  flows = flatten(sites.map(s => {
    const flows = []
    flows.push({
      from: [s.latitude + (Math.random() - 0.5) * 60, s.longitude + (Math.random() - 0.5) * 120],
      to: [s.latitude, s.longitude],
      value: Math.random() * 10,
    })
    return flows
  }))

  tooltip: Tooltip

  data = {
    points: sites.map(s => {
      const normal = +(Math.random() > 0.5)
      return { ...s, normal, danger: 1 - normal }
    }),
    flows: this.flows,
  }

  config: LeafletFlowMapConfigInterface<SitePoint, DDoSFlow> = {
    sourceLongitude: f => f.from[1],
    sourceLatitude: f => f.from[0],
    targetLongitude: f => f.to[1],
    targetLatitude: f => f.to[0],
    flowParticleDensity: f => 0.25 + f.value / 10,
    flowParticleSpeed: f => 0.05 + f.value / 100,
    flowParticleRadius: 1.25,
    valuesMap: {
      normal: {
        color: '#f6c544',
      },
      danger: {
        color: '#e65538',
        className: 'pulse',
      },
    },
    renderer: LeafletMapRenderer.MapLibreGL,
    rendererSettings: {
      ...MapLibreArcticLight,
      sources: {
        openmaptiles: {
          type: 'vector',
          url: 'https://maps.volterra.io/data/v3.json',
        },
      },
      glyphs: 'https://maps.volterra.io/fonts/{fontstack}/{range}.pbf',
    },
    // eslint-disable-next-line no-console
    onSourcePointClick: (f, x, y) => { console.log('onSourcePointClick', f, x, y) },
    onSourcePointMouseEnter: (f, x, y) => {
      // eslint-disable-next-line no-console
      console.log('onSourcePointMouseEnter', f, x, y)
      this.tooltip.show('hello world', { x, y })
    },
    onSourcePointMouseLeave: (f) => {
      // eslint-disable-next-line no-console
      console.log('onSourcePointMouseLeave', f)
      this.tooltip.hide()
    },
    pointRadius: 5,
    pointId: d => d.name,
    clusterOutlineWidth: 2,
    clusterExpandOnClick: true,
    pointBottomLabel: d => d.cluster ? `${d.point_count} sites` : d.name,
    clusterRadius: 65,
    attribution: [
      '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
      '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
    ],
    events: {
      [LeafletFlowMap.selectors.point]: {
        click: d => {
          if (d.properties?.cluster) this.mapContainer?.map.zoomToPointById(d.id, true)
        },
      },
      [LeafletFlowMap.selectors.background]: {
        click: () => { this.mapContainer?.map.unselectPoint() },
      },
    },
  }

  constructor () {
    setInterval(() => {
      this.flows = flatten(sites.map(s => {
        const flows = []
        flows.push({
          from: [s.latitude + (Math.random() - 0.5) * 60, s.longitude + (Math.random() - 0.5) * 120],
          to: [s.latitude, s.longitude],
          value: Math.random() * 10,
        })
        return flows
      }))

      this.data = { ...this.data, flows: this.flows }
    }, 3000)
  }

  ngAfterViewInit (): void {
    this.tooltip = new Tooltip({
      container: this.mapContainer.mapRef.nativeElement,
      positionStrategy: PositionStrategy.Absolute,
      horizontalPlacement: Position.Center,
      verticalPlacement: Position.Top,
    })
  }
}
