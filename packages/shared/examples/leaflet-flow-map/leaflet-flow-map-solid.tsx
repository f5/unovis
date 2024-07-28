import { JSX } from 'solid-js'
import { VisLeafletFlowMap } from '@unovis/solid'

// Data
import { MapPointDataRecord, MapFlowDataRecord, data } from './data'

// !!! Get your own access key from https://maptiler.com
import { mapKey } from './constants'

const LeafletFlowMap = (): JSX.Element => {
  const style = `https://api.maptiler.com/maps/topo/style.json?key=${mapKey}`

  const pointLatitude = (d: MapPointDataRecord) => d.lat
  const pointLongitude = (d: MapPointDataRecord) => d.lon
  const pointBottomLabel = (d: MapPointDataRecord) => d.id

  const sourceLatitude = (d: MapFlowDataRecord) => d.sourceLat
  const sourceLongitude = (d: MapFlowDataRecord) => d.sourceLon
  const targetLatitude = (d: MapFlowDataRecord) => d.targetLat
  const targetLongitude = (d: MapFlowDataRecord) => d.targetLon

  const flowParticleDensity = (d: MapFlowDataRecord) => d.particleDensity
  const pointColor = '#435647'

  return (
    <VisLeafletFlowMap
      height='50dvh'
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
    />
  )
}

export default LeafletFlowMap
