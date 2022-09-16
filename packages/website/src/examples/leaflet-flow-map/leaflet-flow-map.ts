import { LeafletFlowMap, LeafletFlowMapConfigInterface } from '@unovis/ts'

// Data
import { MapPointDataRecord, MapFlowDataRecord, data } from './data'

// !!! Get your own access key from https://maptiler.com
import { mapKey } from './key'

const container = document.getElementById('vis-container') as HTMLDivElement

const config: LeafletFlowMapConfigInterface<MapPointDataRecord, MapFlowDataRecord> = {
  style: `https://api.maptiler.com/maps/topo/style.json?key=${mapKey}`,
  fitViewPadding: [20, 20],

  pointLatitude: (d: MapPointDataRecord) => d.lat,
  pointLongitude: (d: MapPointDataRecord) => d.lon,
  pointBottomLabel: (d: MapPointDataRecord) => d.id,

  sourceLatitude: (d: MapFlowDataRecord) => d.sourceLat,
  sourceLongitude: (d: MapFlowDataRecord) => d.sourceLon,
  targetLatitude: (d: MapFlowDataRecord) => d.targetLat,
  targetLongitude: (d: MapFlowDataRecord) => d.targetLon,

  flowParticleDensity: (d: MapFlowDataRecord) => d.particleDensity,
  flowParticleRadius: 1.0,
  flowParticleColor: '#435647',
  pointRadius: 3,
  pointColor: '#435647',

  attribution: [
    '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
  ],
}

const map = new LeafletFlowMap(container, config, data)
