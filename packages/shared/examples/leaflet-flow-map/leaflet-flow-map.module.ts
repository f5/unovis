import { NgModule } from '@angular/core'
import { VisLeafletFlowMapModule } from '@unovis/angular'

import { LeafletFlowMapComponent } from './leaflet-flow-map.component'

@NgModule({
  imports: [VisLeafletFlowMapModule],
  declarations: [LeafletFlowMapComponent],
  exports: [LeafletFlowMapComponent],
})
export class LeafletFlowMapModule { }
