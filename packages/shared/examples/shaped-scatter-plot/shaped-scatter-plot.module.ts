import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisScatterModule, VisAxisModule, VisTooltipModule, VisBulletLegendModule } from '@unovis/angular'

import { ShapedScatterPlotComponent } from './shaped-scatter-plot.component'

@NgModule({
  imports: [VisXYContainerModule, VisScatterModule, VisAxisModule, VisTooltipModule, VisBulletLegendModule],
  declarations: [ShapedScatterPlotComponent],
  exports: [ShapedScatterPlotComponent],
})
export class ShapedScatterPlotModule { }
