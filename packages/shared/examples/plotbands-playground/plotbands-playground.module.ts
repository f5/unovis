import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisLineModule, VisAxisModule, VisPlotbandModule } from '@unovis/angular'

import { PlotbandsPlaygroundComponent } from './plotbands-playground.component'

@NgModule({
  imports: [VisXYContainerModule, VisLineModule, VisAxisModule, VisPlotbandModule],
  declarations: [PlotbandsPlaygroundComponent],
  exports: [PlotbandsPlaygroundComponent],
})
export class PlotbandsPlaygroundModule { }
