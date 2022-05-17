import { LeafletMap, LeafletMapConfigInterface } from '@volterra/vis'

// Data
import { MapPointDataRecord, data } from './data'

// !!! Get your own access key from https://maptiler.com
import { mapKey } from './key'

const container = document.getElementById('#vis-container')

const config: LeafletMapConfigInterface<MapPointDataRecord> = {
  style: `https://api.maptiler.com/maps/streets/style.json?key=${mapKey}`,
  pointLatitude: d => d.latitude,
  pointLongitude: d => d.longitude,
  pointBottomLabel: d => d.id,
  pointColor: '#286e47',
  clusterExpandOnClick: false,
  attribution: [
    '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
  ],
}

const map = new LeafletMap(container, config, data)
