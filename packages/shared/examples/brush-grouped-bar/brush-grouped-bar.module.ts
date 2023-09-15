import { NgModule } from '@angular/core'
import { VisAxisModule, VisBulletLegendModule, VisBrushModule, VisGroupedBarModule, VisXYContainerModule } from '@unovis/angular'
import { BrushGroupedBarComponent } from './brush-grouped-bar.component'
@NgModule({
  imports: [VisAxisModule, VisBulletLegendModule, VisBrushModule, VisGroupedBarModule, VisXYContainerModule],
  declarations: [BrushGroupedBarComponent],
  exports: [BrushGroupedBarComponent],
})
export class BrushGroupedBarModule { }
