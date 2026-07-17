import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VisXYContainerModule, VisAreaModule, VisLineModule, VisAxisModule, VisCrosshairModule, VisTooltipModule } from '@unovis/angular'

import { SyncedCrosshairsComponent } from './synced-crosshairs.component'

@NgModule({
  imports: [CommonModule, VisXYContainerModule, VisAreaModule, VisLineModule, VisAxisModule, VisCrosshairModule, VisTooltipModule],
  declarations: [SyncedCrosshairsComponent],
  exports: [SyncedCrosshairsComponent],
})
export class SyncedCrosshairsModule { }
