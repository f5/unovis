import L from 'leaflet'
import '@maplibre/maplibre-gl-leaflet/leaflet-maplibre-gl'

import { injectGlobal } from '@emotion/css'

// Inject MapLibreGL global style
// eslint-disable-next-line
import mapboxglCSS from 'maplibre-gl/dist/maplibre-gl.css'

// Utils
import { isObject } from 'utils/data'

// Config
import { LeafletMapConfig } from '../config'

injectGlobal(mapboxglCSS)

export function getMapboxglLayer<Datum> (config: LeafletMapConfig<Datum>): unknown {
  const { accessToken, rendererSettings } = config

  if (isObject(rendererSettings) && !rendererSettings.glyphs) {
    console.warn('Glyphs URL is required in order to show the map. Set `mapboxglGlyphs` URL in the renderer settings')
    return
  }

  if (isObject(rendererSettings) && !rendererSettings.sources) {
    console.warn('Sources settings are required in order to show map. Set the `sources` property in the renderer settings')
    return
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const glLayer = L.maplibreGL({
    style: rendererSettings,
    accessToken: accessToken || 'not-needed',
  })

  return glLayer
}
