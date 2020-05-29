// Copyright (c) Volterra, Inc. All rights reserved.
import L from 'leaflet'
import mapboxGl from 'mapbox-gl'
import 'mapbox-gl-leaflet'

import { injectGlobal } from 'emotion'

// Utils
import { throttle } from 'utils/data'

import { getRendererSettings } from './settings'

// Inject Mapboxgl global style
// eslint-disable-next-line
import mapboxglCSS from 'mapbox-gl/dist/mapbox-gl.css'
injectGlobal(mapboxglCSS)

// Setting mapbox-gl baseApiUrl to null to avoid sending events to events.mapbox.com
mapboxGl.baseApiUrl = null

export function getMapboxglLayer (map, config): any {
  const { accessToken } = config
  const rendererSettings = getRendererSettings(config)

  if (!rendererSettings.glyphs) {
    console.warn('Glyphs URL is required in order to show the map. Set `mapboxglGlyphs` URL in the map config')
    return
  }

  if (!rendererSettings.sources) {
    console.warn('Sources settings are required in order to show map. Set the `sources` property in the map config')
    return
  }

  const glLayer = L.mapboxGL({
    style: rendererSettings,
    accessToken: accessToken || 'not-needed',
  })

  return glLayer
}

export function constraintMapView (map: L.Map, latMin = -75, latMax = 85): void {
  const bounds = map.getBounds()
  const northEast = bounds.getNorthEast()
  const southWest = bounds.getSouthWest()

  if (northEast.lat > latMax && southWest.lat < latMin) {
    map.fitBounds([
      [latMin, 0],
      [latMax, 0],
    ])
  }
}

export function mapboxglWheelEvent (map, layer, event): void {
  const { wheelDelta, deltaY } = event
  if (!layer) return
  const mapboxmap = layer.getMapboxMap()
  const delta = wheelDelta || deltaY * -1 // We use deltaY for Firefox because wheelDelta is not implemented there

  // Prevent Map from being zoomed-out too far away
  const bounds = map.getBounds()
  const northEast = bounds.getNorthEast()
  const southWest = bounds.getSouthWest()
  const latMin = -70
  const latMax = 80
  if (delta < 0 && northEast.lat > latMax && southWest.lat < latMin) {
    constraintMapView(map)
    return
  }

  const zoom = mapboxmap.getZoom() + delta * 0.001
  const xy = map.mouseEventToLayerPoint(event)
  map.setZoomAround(xy, zoom + 1, { animate: false, duration: 0 })
}

export const mapboxglWheelEventThrottled = throttle(mapboxglWheelEvent, 32)
export const constraintMapViewThrottled = throttle(constraintMapView, 1000)
