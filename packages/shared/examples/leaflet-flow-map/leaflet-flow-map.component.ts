import { Component } from '@angular/core'

// Data
import { MapPointDataRecord, MapFlowDataRecord, data } from './data'

// !!! Get your own access key from https://maptiler.com
import { mapKey } from './constants'

@Component({
  selector: 'leaflet-flow-map',
  templateUrl: './leaflet-flow-map.component.html',
})
export class LeafletFlowMapComponent {
  style = `https://api.maptiler.com/maps/topo/style.json?key=${mapKey}`
  fitViewPadding = [20, 20]

  pointLatitude = (d: MapPointDataRecord): number => d.lat
  pointLongitude = (d: MapPointDataRecord): number => d.lon
  pointBottomLabel = (d: MapPointDataRecord): string => d.id

  sourceLatitude = (d: MapFlowDataRecord): number => d.sourceLat
  sourceLongitude = (d: MapFlowDataRecord): number => d.sourceLon
  targetLatitude = (d: MapFlowDataRecord): number => d.targetLat
  targetLongitude = (d: MapFlowDataRecord): number => d.targetLon

  flowParticleDensity = (d: MapFlowDataRecord): number => d.particleDensity
  flowParticleRadius = 1.0
  flowParticleColor = '#435647'
  pointRadius = 3
  pointColor = '#435647'
  attribution = [
    '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
  ]

  data = data
}
