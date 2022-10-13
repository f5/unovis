import type L from 'leaflet'
import type Maplibre from 'maplibre-gl'
import type { Map } from 'maplibre-gl'

import { injectGlobal } from '@emotion/css'

// Utils
import { isObject } from 'utils/data'

// Config
import { LeafletMapConfig } from '../config'
import { MapLibreStyleSpecs } from './map-style'
import { MaplibreGLLayer } from './leaflet-maplibre-gl'

// Inject MapLibreGL global style
import mapLibreStyles from './maplibre-gl.css.js'
injectGlobal(mapLibreStyles)

export function getMaplibreGLLayer<Datum> (config: LeafletMapConfig<Datum>, leaflet: typeof L, maplibre: typeof Maplibre): L.Layer & { getMaplibreMap(): Map } {
  const { accessToken, style } = config

  if (isObject(style) && !(style as MapLibreStyleSpecs).glyphs) {
    console.warn('Unovis | Leaflet Map: Glyphs URL is required in order to show the map. Set `mapboxglGlyphs` URL in the style settings')
    return
  }

  if (isObject(style) && !(style as MapLibreStyleSpecs).sources) {
    console.warn('Unovis | Leaflet Map: Sources settings are required in order to show map. Set the `sources` property in the style settings')
    return
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const layer = MaplibreGLLayer(leaflet, maplibre, {
    style: style,
    accessToken: accessToken || 'not-needed',
  })

  return layer
}
