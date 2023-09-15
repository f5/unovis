import { NgModule } from '@angular/core'
import { VisLeafletMapModule } from '@unovis/angular'

import { BasicLeafletMapComponent } from './basic-leaflet-map.component'

@NgModule({
  imports: [VisLeafletMapModule],
  declarations: [BasicLeafletMapComponent],
  exports: [BasicLeafletMapComponent],
})
export class BasicLeafletMapModule { }
