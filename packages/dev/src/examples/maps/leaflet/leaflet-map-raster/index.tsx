import * as React from 'react'
import { VisLeafletMap } from '@unovis/react'

export const title = 'Raster Leaflet Map'
export const subTitle = 'Raster renderer with PNG'
export const category = 'Leaflet Map'

export const component = (): JSX.Element => {
  return (
    <VisLeafletMap
      style='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      width={1200}
      renderer='raster'
      attribution={[
        '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
        '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
      ]}
    />
  )
}
