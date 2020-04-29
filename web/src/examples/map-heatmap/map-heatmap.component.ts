// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import _ from 'lodash'
import { scaleLinear, max } from 'd3'
import { Component, ViewEncapsulation } from '@angular/core'
import { LeafletMapConfigInterface, WorldMap110mAlphaTopoJSON } from '@volterra/vis'

type MapPoint = {
  id: string;
  longitude: number;
  latitude: number;
  status: string;
  shape: string;
}

function getCountries () {
  const countries: any[] = [
    { name: 'Russian Federation' },
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

function getTopo () {
  const countries = getCountries()
  const colorScale = scaleLinear<string>().range(['#FFFFFF', '#3E5FFF']).domain([0, max(countries, c => c.value)])
  const topo = _.cloneDeep(WorldMap110mAlphaTopoJSON)
  const geometries = topo.objects.countries.geometries
  const newGeometries = []
  countries.forEach((country, id) => {
    const geometry = _.find(geometries, g => g.properties.name === country.name)
    geometry.properties['color-stroke'] = '#3E5FFF'
    geometry.properties['color-area'] = colorScale(country.value)
    newGeometries.push(geometry)
  })
  topo.objects.countries.geometries = newGeometries  
  return topo
}


function getMapConfig (): LeafletMapConfigInterface<MapPoint> {
  return {
    renderer: 'mapboxgl',
    mapboxglGlyphs: 'https://maps.volterra.io/fonts/{fontstack}/{range}.pbf',
    sources: {
      openmaptiles: {
        type: "vector",
        url: "https://maps.volterra.io/data/v3.json"
      },
    },
    accessToken: 'q-wBnCItTPC8Vdj8GA6g8Q',
    initialBounds: { northEast: { lat: 77, lng: -172 }, southWest: { lat: -50, lng: 72 } },
    topoJson: {
      sources: getTopo(),
      featureName: 'countries',
      fillProperty: 'color-area',
      strokeProperty: 'color-stroke',
    },
  }
}

@Component({
  selector: 'map-heatmap',
  templateUrl: './map-heatmap.component.html',
  styleUrls: ['./map-heatmap.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class MapHeatmapComponent {
  title = 'map'
  data = []
  config = getMapConfig()

  onRequestsClick () {
    this.config.topoJson.sources = getTopo()
    this.config = { ...this.config }
  }

  onThroughputClick () {
    this.config.topoJson.sources = getTopo()
    this.config = { ...this.config }
  }

  onBandwidthClick () {
    this.config.topoJson.sources = getTopo()
    this.config = { ...this.config }
  }

  onSecurityClick () {
    this.config.topoJson.sources = getTopo()
    this.config = { ...this.config }
  }
}
