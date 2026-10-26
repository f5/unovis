import React, { useCallback } from 'react'
import { VisLeafletMap } from '@unovis/react'

// Data
import { MapPointDataRecord, data } from '../basic-leaflet-map/data'

// !!! Get your own access key from https://maptiler.com
import { mapKey } from '../basic-leaflet-map/constants'

// Dev-only example: loads the MapLibre worker from a same-origin file instead of a Blob URL,
// so it works with a CSP that doesn't allow `blob:` in `worker-src` (`pnpm dev:gallery:csp`)
export default function LeafletMapCspWorker (): JSX.Element {
  const style = `https://api.maptiler.com/maps/streets/style.json?key=${mapKey}`
  const pointLatitude = useCallback((d: MapPointDataRecord) => d.latitude, [])
  const pointLongitude = useCallback((d: MapPointDataRecord) => d.longitude, [])
  const pointBottomLabel = useCallback((d: MapPointDataRecord) => d.id, [])
  const pointColor = '#286e47'
  return (
    <VisLeafletMap
      height="50vh"
      data={data}
      style={style}
      useMaplibreWorkerBlob={false}
      pointLatitude={pointLatitude}
      pointLongitude={pointLongitude}
      pointBottomLabel={pointBottomLabel}
      pointColor={pointColor}
      clusterExpandOnClick={false}
      attribution={[
        '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
        '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
      ]}
    ></VisLeafletMap>
  )
}
