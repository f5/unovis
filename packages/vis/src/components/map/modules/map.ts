// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection, event } from 'd3-selection'
import L from 'leaflet'

// Types
import { MapRenderer } from 'types/map'

// Config
// import { MapConfig } from '../config'

import { getTangramLayer } from './tangram'
import { getMapboxglLayer, mapboxglWheelEventThrottled } from './mapboxgl'

export function setupMap (mapContainer, config): { map: L.Map; layer: L.Layer; svgOverlay: Selection<SVGElement, any, HTMLElement, any>; svgGroup: Selection<SVGGElement, any, SVGElement, any> } {
  const { nextzenApiKey, renderer } = config
  if (renderer === MapRenderer.TANGRAM && !nextzenApiKey) console.warn('To show map provide Nextzen Api Key')

  const map = L.map(mapContainer, {
    scrollWheelZoom: renderer === MapRenderer.TANGRAM, // We define custom scroll event for MapboxGL to enabling smooth zooming
    zoomControl: false,
    zoomDelta: 0.5,
    zoomSnap: 0,
    attributionControl: false,
    center: [36, 14],
    zoom: 1.9,
    minZoom: Math.sqrt(mapContainer.offsetWidth) / 17,
    maxZoom: 18,
    maxBounds: L.latLngBounds(
      L.latLng(-89.98155760646617, -290),
      L.latLng(89.99346179538875, 290)
    ),
    maxBoundsViscosity: 0.5,
  })

  let layer
  switch (renderer) {
  case 'tangram': {
    layer = getTangramLayer(config)
    break
  }
  case 'mapboxgl':
  default: {
    layer = getMapboxglLayer(map, config)
    select(mapContainer)
      .on('wheel', () => {
        event.preventDefault()
        mapboxglWheelEventThrottled(map, layer, event)
      })
    break
  }
  }

  if (layer) layer.addTo(map)

  const svgOverlay = select(map.getPanes().overlayPane).append('svg')
  const svgGroup = svgOverlay.append('g')

  return {
    map,
    layer,
    svgOverlay,
    svgGroup,
  }
}
