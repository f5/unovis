// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection, event } from 'd3-selection'
import L from 'leaflet'

// Types
import { LeafletMapRenderer } from 'types/map'

// Config
import { LeafletMapConfigInterface } from '../config'

// Layers
import { getTangramLayer } from '../renderer/tangram-layer'
import { getMapboxglLayer, mapboxglWheelEventThrottled } from '../renderer/mapboxgl-layer'

export function setupMap<T> (mapContainer: HTMLElement, config: LeafletMapConfigInterface<T>): { leaflet: L.Map; layer: L.Layer; svgOverlay: Selection<SVGElement, any, HTMLElement, any>; svgGroup: Selection<SVGGElement, any, SVGElement, any> } {
  const { renderer } = config

  const leaflet = L.map(mapContainer, {
    scrollWheelZoom: renderer === LeafletMapRenderer.TANGRAM, // We define custom scroll event for MapboxGL to enabling smooth zooming
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
  case LeafletMapRenderer.TANGRAM : {
    layer = getTangramLayer(config)
    break
  }
  case LeafletMapRenderer.MAPBOXGL :
  default: {
    layer = getMapboxglLayer(leaflet, config)
    select(mapContainer)
      .on('wheel', () => {
        event.preventDefault()
        mapboxglWheelEventThrottled(leaflet, layer, event)
      })
    break
  }
  }

  if (layer) layer.addTo(leaflet)

  const svgOverlay = select(leaflet.getPanes().overlayPane).append('svg')
  const svgGroup = svgOverlay.append('g')

  return {
    leaflet,
    layer,
    svgOverlay,
    svgGroup,
  }
}
