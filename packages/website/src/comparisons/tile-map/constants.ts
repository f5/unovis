import { mapStyleLight, mapStyleDark } from '@unovis/shared/examples/advanced-leaflet-map/data'

// The vector styles from the gallery's Advanced Leaflet Map example, drawn on the MapLibre demo tiles (country polygons
// from Natural Earth, zoom levels 0 to 6), so the map needs no API key
export const MAP_STYLE = mapStyleLight
export const MAP_STYLE_DARK = mapStyleDark

export const MAP_ATTRIBUTION = [
  '<a href="https://github.com/maplibre/demotiles" target="_blank">MapLibre demo tiles</a>',
  '<a href="https://www.naturalearthdata.com/" target="_blank">Natural Earth</a>',
]
