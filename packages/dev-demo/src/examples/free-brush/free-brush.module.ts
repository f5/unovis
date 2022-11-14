//
import { FreeBrushComponent } from 'examples/free-brush/free-brush.component'
import { NgModule } from '@angular/core'
import { VisAxisModule, VisAreaModule, VisFreeBrushModule, VisTooltipModule, VisXYContainerModule, VisCrosshairModule } from '@unovis/angular'

@NgModule({
  imports: [VisAxisModule, VisAreaModule, VisFreeBrushModule, VisTooltipModule, VisXYContainerModule, VisCrosshairModule],
  declarations: [FreeBrushComponent],
  exports: [FreeBrushComponent],
})
export class FreeBrushModule { }
