//
import { AtomicAngularWrapperComponent } from 'examples/atomic-angular-wrapper/atomic-angular-wrapper.component'
import { NgModule } from '@angular/core'
import {
  VisXYContainerModule,
  VisAreaModule,
  VisLineModule,
  VisAxisModule,
  VisTooltipModule,
  VisCrosshairModule,
  VisFreeBrushModule,
  VisXYLabelsModule,
  VisBulletLegendModule,
} from '@unovis/angular'

@NgModule({
  imports: [VisXYContainerModule, VisAreaModule, VisLineModule, VisAxisModule, VisCrosshairModule, VisTooltipModule, VisFreeBrushModule, VisXYLabelsModule, VisBulletLegendModule],
  declarations: [AtomicAngularWrapperComponent],
  exports: [AtomicAngularWrapperComponent],
})
export class AtomicAngularWrapperModule { }
