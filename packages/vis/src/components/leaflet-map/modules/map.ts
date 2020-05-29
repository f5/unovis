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
import { getMapboxglLayer, constraintMapView, mapboxglWheelEventThrottled } from '../renderer/mapboxgl-layer'

// Styles
import * as s from '../style'

export const initialMapCenter: L.LatLngExpression = [36, 14]
export const initialMapZoom = 1.9

export function updateTopoJson<T> (map, config: LeafletMapConfigInterface<T>): void {
  const { topoJSONLayer } = config

  if (topoJSONLayer.sources) {
    const featureObject = topoJSONLayer.sources?.objects?.[topoJSONLayer.featureName]
    if (featureObject) {
      const mapSource = map.getSource(topoJSONLayer.featureName)
      const featureCollection = feature(topoJSONLayer.sources, featureObject)
      if (mapSource) {
        mapSource.setData(featureCollection)
      } else {
        map.addSource(topoJSONLayer.featureName, { type: 'geojson', data: featureCollection })
      }
    }
  }

  const fillLayer = map.getLayer(`${topoJSONLayer.featureName}-area`)
  if (topoJSONLayer.fillProperty) {
    if (!fillLayer) {
      map.addLayer({
        id: `${topoJSONLayer.featureName}-area`,
        type: 'fill',
        source: topoJSONLayer.featureName,
        paint: {
          'fill-antialias': false,
          'fill-opacity': topoJSONLayer.fillOpacity,
        },
      })
    }
    map.setPaintProperty(`${topoJSONLayer.featureName}-area`, 'fill-color', [
      'case',
      ['!', ['has', topoJSONLayer.fillProperty]],
      'rgba(255, 255, 255, 0)',
      ['get', topoJSONLayer.fillProperty],
    ])
  } else if (fillLayer) map.removeLayer(`${topoJSONLayer.featureName}-area`)

  const strokeLayer = map.getLayer(`${topoJSONLayer.featureName}-stroke`)
  if (topoJSONLayer.strokeProperty) {
    if (!strokeLayer) {
      map.addLayer({
        id: `${topoJSONLayer.featureName}-stroke`,
        type: 'line',
        source: topoJSONLayer.featureName,
        paint: {
          'line-opacity': topoJSONLayer.strokeOpacity,
          'line-width': topoJSONLayer.strokeWidth,
        },
      })
    }
    map.setPaintProperty(`${topoJSONLayer.featureName}-stroke`, 'line-color', [
      'case',
      ['!', ['has', topoJSONLayer.strokeProperty]],
      'rgba(255, 255, 255, 0)',
      ['get', topoJSONLayer.strokeProperty],
    ])
  } else if (strokeLayer) map.removeLayer(`${topoJSONLayer.featureName}-stroke`)
}

export function setupMap<T> (mapContainer: HTMLElement, config: LeafletMapConfigInterface<T>): { leaflet: L.Map; layer: L.Layer; svgOverlay: Selection<SVGElement, any, HTMLElement, any>; svgGroup: Selection<SVGGElement, any, SVGElement, any> } {
  const { renderer, topoJSONLayer } = config

  const leaflet = L.map(mapContainer, {
    scrollWheelZoom: renderer === LeafletMapRenderer.TANGRAM, // We define custom scroll event for MapboxGL to enabling smooth zooming
    zoomControl: false,
    zoomDelta: 0.5,
    zoomSnap: 0,
    attributionControl: false,
    center: initialMapCenter,
    zoom: initialMapZoom,
    minZoom: Math.sqrt(mapContainer.offsetWidth) / 17,
    maxBounds: L.latLngBounds(
      L.latLng(-75, -290),
      L.latLng(85, 290)
    ),
    maxBoundsViscosity: 1,
  })

  let layer
  switch (renderer) {
  case LeafletMapRenderer.TANGRAM: {
    layer = getTangramLayer(config)
    layer.addTo(leaflet)
    break
  }
  case LeafletMapRenderer.MAPBOXGL:
  default: {
    layer = getMapboxglLayer(leaflet, config)
    layer.addTo(leaflet)

    // leaflet-mapbox-gl has a layer positioning issue on far zoom levels which leads to having wrong
    //   map points projection. We're constraing the view to prevent that.
    constraintMapView(leaflet)
    select(mapContainer)
      .on('wheel', () => {
        event.preventDefault()
        mapboxglWheelEventThrottled(leaflet, layer, event)
      })
    break
  }
  }

  if (topoJSONLayer?.sources && renderer === LeafletMapRenderer.MAPBOXGL) {
    const mapboxmap = layer.getMapboxMap()
    const canvas = mapboxmap.getCanvas()
    select(canvas).classed(s.mapboxglCanvas, true)
    mapboxmap.on('mousemove', (event) => {
      const feature = mapboxmap.queryRenderedFeatures(event.point)
      select(canvas).datum(feature)
      select(canvas).classed(s.onFeatureHover, Boolean(feature?.length))
    })
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
