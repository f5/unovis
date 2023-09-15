import { NgModule } from '@angular/core'
import { VisAxisModule, VisCrosshairModule, VisXYContainerModule, VisStackedBarModule, VisTooltipModule } from '@unovis/angular'

import { CrosshairStackedBarComponent } from './crosshair-stacked-bar.component'

@NgModule({
  imports: [VisAxisModule, VisCrosshairModule, VisXYContainerModule, VisStackedBarModule, VisTooltipModule],
  declarations: [CrosshairStackedBarComponent],
  exports: [CrosshairStackedBarComponent],
})
export class CrosshairStackedBarModule { }
