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
  const { accessToken, style } = config

  if (isObject(style) && !style.glyphs) {
    console.warn('Unovis | Leaflet Map: Glyphs URL is required in order to show the map. Set `mapboxglGlyphs` URL in the style settings')
    return
  }

  if (isObject(style) && !style.sources) {
    console.warn('Unovis | Leaflet Map: Sources settings are required in order to show map. Set the `sources` property in the style settings')
    return
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const glLayer = L.maplibreGL({
    style: style,
    accessToken: accessToken || 'not-needed',
  })

  return glLayer
}
