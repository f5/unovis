import React, { useCallback } from 'react'
import { VisLeafletMap } from '@volterra/vis-react'

// Data
import { MapPointDataRecord, data } from './data'

// !!! Get your own access key from https://maptiler.com
import { mapKey } from './key'

export default function BasicLeafletMap (): JSX.Element {
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
