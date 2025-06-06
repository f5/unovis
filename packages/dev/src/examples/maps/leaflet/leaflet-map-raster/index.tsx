import * as React from 'react'
import { VisLeafletMap } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Raster Leaflet Map'
export const subTitle = 'Raster renderer with PNG'

export const component = (): React.ReactNode => {
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
