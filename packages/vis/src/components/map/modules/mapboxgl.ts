// Copyright (c) Volterra, Inc. All rights reserved.
import L from 'leaflet'
import mapboxGl from 'mapbox-gl'
import 'mapbox-gl-leaflet'
// import 'mapbox-gl/src/css/mapbox-gl.css'

// Utils
import { throttle } from 'utils/data'

import { getRendererSettings } from '../mapStyles/settings'

// Setting mapbox-gl baseApiUrl to null to avoid sending events to events.mapbox.com
mapboxGl.baseApiUrl = null

export function getMapboxglLayer (map, config): any {
  const { mapboxglAccessToken, mapboxglGlyphs, mapboxglSources } = config
  const styleSettings = getRendererSettings(config)
  if (!mapboxglGlyphs && !styleSettings.glyphs) {
    console.warn('Glyphs url is requires in style settings to show map. Set URL to `mapboxglGlyphs` config')
    return
  } else if (mapboxglGlyphs) {
    styleSettings.glyphs = mapboxglGlyphs
  }
  if (!mapboxglSources && !styleSettings.sources) {
    console.warn('Sources url is requires in style settings to show map. Set URL to `mapboxglGlyphs` config')
    return
  } else if (mapboxglSources) {
    styleSettings.sources = mapboxglSources
  }

  const glLayer = L.mapboxGL({
    style: styleSettings,
    accessToken: mapboxglAccessToken,
  })

  return glLayer
}

export function mapboxglWheelEvent (map, layer, event): void {
  const { wheelDelta, deltaY } = event
  if (!layer) return
  const mapboxmap = layer.getMapboxMap()
  const delta = wheelDelta || deltaY * -1
  const zoom = mapboxmap.getZoom() + delta * 0.001
  const xy = map.mouseEventToLayerPoint(event)
  map.setZoomAround(xy, zoom + 1, { animate: false, duration: 0 })
}

export const mapboxglWheelEventThrottled = throttle(mapboxglWheelEvent, 32)
