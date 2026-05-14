import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VisXYContainerModule, VisLineModule, VisAxisModule, VisPlotlineModule } from '@unovis/angular'

import { SyncedAutoPositionComponent } from './synced-auto-position.component'

@NgModule({
  imports: [CommonModule, VisXYContainerModule, VisLineModule, VisAxisModule, VisPlotlineModule],
  declarations: [SyncedAutoPositionComponent],
  exports: [SyncedAutoPositionComponent],
})
export class SyncedAutoPositionModule { }
