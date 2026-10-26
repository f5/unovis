import { NgModule } from '@angular/core'
import { VisLeafletMapModule } from '@unovis/angular'

import { LeafletMapCspWorkerComponent } from './leaflet-map-csp-worker.component'

@NgModule({
  imports: [VisLeafletMapModule],
  declarations: [LeafletMapCspWorkerComponent],
  exports: [LeafletMapCspWorkerComponent],
})
export class LeafletMapCspWorkerModule { }
