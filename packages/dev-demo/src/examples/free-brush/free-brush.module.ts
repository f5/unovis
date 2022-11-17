import { NgModule } from '@angular/core'
import { VisAxisModule, VisAreaModule, VisFreeBrushModule, VisTooltipModule, VisXYContainerModule, VisCrosshairModule } from '@unovis/angular'

import { FreeBrushComponent } from './free-brush.component'
@NgModule({
  imports: [VisAxisModule, VisAreaModule, VisFreeBrushModule, VisTooltipModule, VisXYContainerModule, VisCrosshairModule],
  declarations: [FreeBrushComponent],
  exports: [FreeBrushComponent],
})
export class FreeBrushModule { }
