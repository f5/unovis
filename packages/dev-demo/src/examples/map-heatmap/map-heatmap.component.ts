// Copyright (c) Volterra, Inc. All rights reserved.
import _ from 'lodash'
import { Feature } from 'geojson'
import { Style } from 'maplibre-gl'
// eslint-disable-next-line import/no-unresolved
import { Topology } from 'topojson-specification'

import { scaleLinear, max } from 'd3'
import { Component, ViewEncapsulation, AfterViewInit } from '@angular/core'
import { LeafletMap, LeafletMapConfigInterface, WorldMap110mAlphaTopoJSON, Tooltip, LeafletMapRenderer } from '@volterra/vis'

// Configuration
import { lightTheme, darkTheme } from '../map/config'

type MapPoint = {
  id: string;
  longitude: number;
  latitude: number;
  status: string;
  shape: string;
}

const FILL_PROPERTY = 'color-area'
const STROKE_PROPERTY = 'color-stroke'

function getCountries (): {name: string; value: number }[] {
  const countries: any[] = [
    { name: 'Canada' },
    { name: 'Sudan' },
    { name: 'India' },
    { name: 'United States' },
    { name: 'Spain' },
    { name: 'Kazakhstan' },
    { name: 'China' },
    { name: 'Libya' },
  ]
  countries.forEach(c => { c.value = Math.random() * 10 })
  return countries
}

function getTopo (): Topology {
  const countries = getCountries()
  const colorScale = scaleLinear<string>().range(['#FFFFFF', '#3E5FFF']).domain([0, max(countries, c => c.value)])
  const topo = _.cloneDeep(WorldMap110mAlphaTopoJSON) as typeof WorldMap110mAlphaTopoJSON
  const geometries = topo.objects.countries.geometries
  const newGeometries = []
  countries.forEach((country, id) => {
    const geometry = _.find(geometries, g => g.properties.name === country.name)
    geometry.properties[STROKE_PROPERTY] = '#3E5FFF'
    geometry.properties[FILL_PROPERTY] = colorScale(country.value)
    newGeometries.push(geometry)
  })
  topo.objects.countries.geometries = newGeometries
  return topo
}

function getMapConfig (): LeafletMapConfigInterface<MapPoint> {
  return {
    renderer: LeafletMapRenderer.MapLibreGL,
    rendererSettings: lightTheme as Style,
    rendererSettingsDarkTheme: darkTheme as Style,
    attribution: [
      '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
    ],
    initialBounds: { northEast: { lat: 77, lng: -172 }, southWest: { lat: -50, lng: 72 } },
    topoJSONLayer: {
      sources: getTopo(),
      featureName: 'countries',
      fillProperty: FILL_PROPERTY,
      strokeProperty: STROKE_PROPERTY,
    },
  }
}

@Component({
  selector: 'map-heatmap',
  templateUrl: './map-heatmap.component.html',
  styleUrls: ['./map-heatmap.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class MapHeatmapComponent implements AfterViewInit {
  title = 'map'
  data = []
  config = getMapConfig()

  ngAfterViewInit (): void {
    this.config.tooltip = new Tooltip({
      triggers: {
        [LeafletMap.selectors.mapboxglCanvas]: (features: Feature[]) => {
          let name
          if (features?.length) {
            name = features[0].properties.name
          }

          return name && `<span>${name}</span>`
        },
      },
    })
    this.config = { ...this.config }
  }

  onRequestsClick (): void {
    this.config.topoJSONLayer.sources = getTopo()
    this.config = { ...this.config }
  }

  onThroughputClick (): void {
    this.config.topoJSONLayer.sources = getTopo()
    this.config = { ...this.config }
  }

  onBandwidthClick (): void {
    this.config.topoJSONLayer.sources = getTopo()
    this.config = { ...this.config }
  }

  onSecurityClick (): void {
    this.config.topoJSONLayer.sources = getTopo()
    this.config = { ...this.config }
  }
}
