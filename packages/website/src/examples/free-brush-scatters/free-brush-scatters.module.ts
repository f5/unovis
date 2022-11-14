import { NgModule } from '@angular/core'
import { VisAxisModule, VisBulletLegendModule, VisFreeBrushModule, VisScatterModule, VisXYContainerModule } from '@unovis/angular'
import { FreeBrushScattersComponent } from './free-brush-scatters.component'

@NgModule({
  imports: [VisAxisModule, VisBulletLegendModule, VisFreeBrushModule, VisScatterModule, VisXYContainerModule],
  declarations: [FreeBrushScattersComponent],
  exports: [FreeBrushScattersComponent],
})
export class FreeBrushScattersModule { }
