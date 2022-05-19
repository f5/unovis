import { Component } from '@angular/core'

// Data
import { MapPointDataRecord, data } from './data'

// !!! Get your own access key from https://maptiler.com
import { mapKey } from './key'

@Component({
  selector: 'basic-leaflet-map',
  templateUrl: './basic-leaflet-map.component.html',
})
export class BasicLeafletMapComponent {
  style = `https://api.maptiler.com/maps/streets/style.json?key=${mapKey}`
  pointLatitude = (d: MapPointDataRecord) => d.latitude
  pointLongitude = (d: MapPointDataRecord) => d.longitude
  pointBottomLabel = (d: MapPointDataRecord) => d.id
  pointColor = '#286e47'
  clusterExpandOnClick = false
  attribution = [
    '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
  ]
  data = data
}
