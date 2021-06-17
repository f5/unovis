// Copyright (c) Volterra, Inc. All rights reserved.
import L from 'leaflet'
import mapboxGl from 'mapbox-gl'
import 'mapbox-gl-leaflet'

import { injectGlobal } from 'emotion'

import { getRendererSettings } from './settings'

// Inject Mapboxgl global style
// eslint-disable-next-line
import mapboxglCSS from 'mapbox-gl/dist/mapbox-gl.css'

// Config
import { LeafletMapConfig } from '../config'
injectGlobal(mapboxglCSS)

// Setting mapbox-gl baseApiUrl to null to avoid sending events to events.mapbox.com
mapboxGl.baseApiUrl = null

export function getMapboxglLayer<Datum> (config: LeafletMapConfig<Datum>): any {
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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const glLayer = L.mapboxGL({
    style: rendererSettings,
    accessToken: accessToken || 'not-needed',
  })

  return glLayer
}
