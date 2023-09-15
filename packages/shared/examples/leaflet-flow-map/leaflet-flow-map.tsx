import React, { useCallback } from 'react'
import { VisLeafletFlowMap } from '@unovis/react'

// Data
import { MapPointDataRecord, MapFlowDataRecord, data } from './data'

// !!! Get your own access key from https://maptiler.com
import { mapKey } from './constants'

export default function LeafletFlowMap (): JSX.Element {
  const style = `https://api.maptiler.com/maps/topo/style.json?key=${mapKey}`
  const pointLatitude = useCallback((d: MapPointDataRecord) => d.lat, [])
  const pointLongitude = useCallback((d: MapPointDataRecord) => d.lon, [])
  const pointBottomLabel = useCallback((d: MapPointDataRecord) => d.id, [])

  const sourceLatitude = useCallback((d: MapFlowDataRecord) => d.sourceLat, [])
  const sourceLongitude = useCallback((d: MapFlowDataRecord) => d.sourceLon, [])
  const targetLatitude = useCallback((d: MapFlowDataRecord) => d.targetLat, [])
  const targetLongitude = useCallback((d: MapFlowDataRecord) => d.targetLon, [])
  const flowParticleDensity = useCallback((d: MapFlowDataRecord) => d.particleDensity, [])

  const pointColor = '#435647'
  return (
    <VisLeafletFlowMap
      height="60vh"
      data={data}
      style={style}
      fitViewPadding={[20, 20]}
      pointLatitude={pointLatitude}
      pointLongitude={pointLongitude}
      pointBottomLabel={pointBottomLabel}
      sourceLatitude={sourceLatitude}
      sourceLongitude={sourceLongitude}
      targetLatitude={targetLatitude}
      targetLongitude={targetLongitude}
      flowParticleDensity={flowParticleDensity}
      flowParticleRadius={1.0}
      flowParticleColor={pointColor}
      pointColor={pointColor}
      pointRadius={3}
      attribution={[
        '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
        '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
      ]}
    ></VisLeafletFlowMap>
  )
}
