import { NgModule } from '@angular/core'
import { VisLeafletMapModule } from '@unovis/angular'

import { AdvancedLeafletMapComponent } from './advanced-leaflet-map.component'

@NgModule({
  imports: [VisLeafletMapModule],
  declarations: [AdvancedLeafletMapComponent],
  exports: [AdvancedLeafletMapComponent],
})
export class AdvancedLeafletMapModule { }
