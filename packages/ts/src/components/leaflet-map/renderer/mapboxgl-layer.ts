import type L from 'leaflet'
import type { Map, LngLat } from 'maplibre-gl'

import { injectGlobal } from '@emotion/css'

// Utils
import { isObject } from 'utils/data'

// Types
import { GenericDataRecord } from 'types/data'

// Config
import { LeafletMapConfigInterface } from '../config'
import { MapLibreStyleSpecs } from './map-style'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { MaplibreGLLayer } from './leaflet-maplibre-gl'

// Inject MapLibreGL global style
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mapLibreStyles from './maplibre-gl.css.js'
injectGlobal(mapLibreStyles)

// The subset of the MapLibre GL module that `leaflet-maplibre-gl` consumes at runtime
export type MaplibreModule = {
  /* eslint-disable @typescript-eslint/naming-convention -- matches the MapLibre GL export names */
  Map: typeof Map;
  LngLat: typeof LngLat;
  /* eslint-enable @typescript-eslint/naming-convention */
}

export function getMaplibreGLLayer<Datum extends GenericDataRecord> (
  config: LeafletMapConfigInterface<Datum>,
  leaflet: typeof L,
  maplibre: MaplibreModule
): L.Layer & { getMaplibreMap(): Map } {
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
