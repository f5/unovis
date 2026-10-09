import { mapKey } from '@unovis/shared/examples/basic-leaflet-map/constants'

// Vector map styles from MapTiler, with the key used across the Unovis docs
export const MAP_STYLE = `https://api.maptiler.com/maps/positron/style.json?key=${mapKey}`
export const MAP_STYLE_DARK = `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${mapKey}`

export const MAP_ATTRIBUTION = [
  '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
]
