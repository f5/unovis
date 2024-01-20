import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisScatterModule, VisAxisModule, VisBulletLegendModule } from '@unovis/angular'

import { BasicScatterPlotComponent } from './basic-scatter-plot.component'

@NgModule({
  imports: [VisXYContainerModule, VisScatterModule, VisAxisModule, VisBulletLegendModule],
  declarations: [BasicScatterPlotComponent],
  exports: [BasicScatterPlotComponent],
})
export class BasicScatterPlotModule { }
