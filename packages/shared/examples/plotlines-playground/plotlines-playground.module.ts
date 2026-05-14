import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisLineModule, VisAxisModule, VisPlotlineModule } from '@unovis/angular'

import { PlotlinesPlaygroundComponent } from './plotlines-playground.component'

@NgModule({
  imports: [VisXYContainerModule, VisLineModule, VisAxisModule, VisPlotlineModule],
  declarations: [PlotlinesPlaygroundComponent],
  exports: [PlotlinesPlaygroundComponent],
})
export class PlotlinesPlaygroundModule { }
