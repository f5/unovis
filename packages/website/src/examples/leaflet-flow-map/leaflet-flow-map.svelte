  <script lang="ts">
    import { VisLeafletFlowMap } from '@unovis/svelte'

    // Data
    import { MapPointDataRecord, MapFlowDataRecord, data } from './data'

    // !!! Get your own access key from https://maptiler.com
    import { mapKey } from './constants'

    const style = `https://api.maptiler.com/maps/topo/style.json?key=${mapKey}`
    const fitViewPadding = [20, 20]

    const pointLatitude = (d: MapPointDataRecord) => d.lat
    const pointLongitude = (d: MapPointDataRecord) => d.lon
    const pointBottomLabel = (d: MapPointDataRecord) => d.id

    const sourceLatitude = (d: MapFlowDataRecord) => d.sourceLat
    const sourceLongitude = (d: MapFlowDataRecord) => d.sourceLon
    const targetLatitude = (d: MapFlowDataRecord) => d.targetLat
    const targetLongitude = (d: MapFlowDataRecord) => d.targetLon

    const flowParticleDensity = (d: MapFlowDataRecord) => d.particleDensity
    const flowParticleRadius = 1.0
    const flowParticleColor = '#435647'
    const pointRadius = 3
    const pointColor = '#435647'
  </script>


<VisLeafletFlowMap
  height="50vh"
  {data}
  {style}
  {fitViewPadding}
  {pointLatitude}
  {pointLongitude}
  {pointBottomLabel}
  {sourceLatitude}
  {sourceLongitude}
  {targetLatitude}
  {targetLongitude}
  {flowParticleDensity}
  {flowParticleRadius}
  {flowParticleColor}
  {pointRadius}
  {pointColor}
  attribution={[
    '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
  ]}/>



