import { NgModule } from '@angular/core'
import {
  VisXYContainerModule,
  VisLineModule,
  VisAreaModule,
  VisScatterModule,
  VisAxisModule,
  VisCrosshairModule,
  VisTooltipModule,
} from '@unovis/angular'

import { SynchronizedCrosshairComponent } from './synchronized-crosshair.component'

@NgModule({
  imports: [VisXYContainerModule, VisLineModule, VisAreaModule, VisScatterModule, VisAxisModule, VisCrosshairModule, VisTooltipModule],
  declarations: [SynchronizedCrosshairComponent],
  exports: [SynchronizedCrosshairComponent],
})
export class SynchronizedCrosshairModule { }
