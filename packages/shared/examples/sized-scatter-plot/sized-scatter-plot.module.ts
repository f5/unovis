import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisScatterModule, VisAxisModule, VisTooltipModule, VisBulletLegendModule } from '@unovis/angular'

import { SizedScatterPlotComponent } from './sized-scatter-plot.component'

@NgModule({
  imports: [VisXYContainerModule, VisScatterModule, VisAxisModule, VisTooltipModule, VisBulletLegendModule],
  declarations: [SizedScatterPlotComponent],
  exports: [SizedScatterPlotComponent],
})
export class SizedScatterPlotModule { }
