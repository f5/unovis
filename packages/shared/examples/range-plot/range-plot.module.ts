import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisBulletLegendModule, VisTooltipModule, VisAxisModule, VisScatterModule, VisLineModule } from '@unovis/angular'

import { RangePlotComponent } from './range-plot.component'

@NgModule({
  imports: [VisXYContainerModule, VisBulletLegendModule, VisTooltipModule, VisAxisModule, VisScatterModule, VisLineModule],
  declarations: [RangePlotComponent],
  exports: [RangePlotComponent],
})
export class RangePlotModule { }
