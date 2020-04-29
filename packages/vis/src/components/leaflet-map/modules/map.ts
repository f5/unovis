// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection, event } from 'd3-selection'
import L from 'leaflet'
import { feature } from 'topojson'

// Types
import { LeafletMapRenderer } from 'types/map'

// Config
import { LeafletMapConfigInterface } from '../config'

// Layers
import { getTangramLayer } from '../renderer/tangram-layer'
import { getMapboxglLayer, mapboxglWheelEventThrottled } from '../renderer/mapboxgl-layer'

export const initialMapCenter: L.LatLngExpression = [36, 14]
export const initialMapZoom = 1.9

export function updateTopoJson<T> (map, config: LeafletMapConfigInterface<T>): void {
  const { topoJson } = config

  if (topoJson.sources) {
    const featureObject = topoJson.sources?.objects?.[topoJson.featureName]
    if (featureObject) {
      const mapSource = map.getSource(topoJson.featureName)
      const featureCollection = feature(topoJson.sources, featureObject)
      if (mapSource) {
        mapSource.setData(featureCollection)
      } else {
        map.addSource(topoJson.featureName, { type: 'geojson', data: featureCollection })
      }
    }
  }

  const fillLayer = map.getLayer(`${topoJson.featureName}-area`)
  if (topoJson.fillProperty) {
    if (!fillLayer) {
      map.addLayer({
        id: `${topoJson.featureName}-area`,
        type: 'fill',
        source: topoJson.featureName,
        paint: {
          'fill-antialias': false,
          'fill-opacity': 0.6,
        },
      })
    }
    map.setPaintProperty(`${topoJson.featureName}-area`, 'fill-color', [
      'case',
      ['!', ['has', topoJson.fillProperty]],
      'rgba(255, 255, 255, 0)',
      ['get', topoJson.fillProperty],
    ])
  } else if (fillLayer) map.removeLayer(`${topoJson.featureName}-area`)
  map.on('click', `${topoJson.featureName}-area`, e => {
    console.log(e.features)
  })

  const strokeLayer = map.getLayer(`${topoJson.featureName}-stroke`)
  if (topoJson.strokeProperty) {
    if (!strokeLayer) {
      map.addLayer({
        id: `${topoJson.featureName}-stroke`,
        type: 'line',
        source: topoJson.featureName,
        paint: {
          'line-opacity': 0.8,
          'line-width': 1,
        },
      })
    }
    map.setPaintProperty(`${topoJson.featureName}-stroke`, 'line-color', [
      'case',
      ['!', ['has', topoJson.strokeProperty]],
      'rgba(255, 255, 255, 0)',
      ['get', topoJson.strokeProperty],
    ])
  } else if (strokeLayer) map.removeLayer(`${topoJson.featureName}-stroke`)
}

export function setupMap<T> (mapContainer: HTMLElement, config: LeafletMapConfigInterface<T>): { leaflet: L.Map; layer: L.Layer; svgOverlay: Selection<SVGElement, any, HTMLElement, any>; svgGroup: Selection<SVGGElement, any, SVGElement, any> } {
  const { renderer, topoJson } = config

  const leaflet = L.map(mapContainer, {
    scrollWheelZoom: renderer === LeafletMapRenderer.TANGRAM, // We define custom scroll event for MapboxGL to enabling smooth zooming
    zoomControl: false,
    zoomDelta: 0.5,
    zoomSnap: 0,
    attributionControl: false,
    center: initialMapCenter,
    zoom: initialMapZoom,
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
  case LeafletMapRenderer.TANGRAM: {
    layer = getTangramLayer(config)
    break
  }
  case LeafletMapRenderer.MAPBOXGL:
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

  if (topoJson && renderer === LeafletMapRenderer.MAPBOXGL) {
    const mapboxmap = layer.getMapboxMap()
    mapboxmap.on('load', () => {
      updateTopoJson(mapboxmap, config)
    })
  }

  const svgOverlay = select(leaflet.getPanes().overlayPane).append('svg')
  const svgGroup = svgOverlay.append('g')

  return {
    leaflet,
    layer,
    svgOverlay,
    svgGroup,
  }
}
