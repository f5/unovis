import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisLineModule, VisAxisModule, VisPlotbandModule, VisPlotlineModule } from '@unovis/angular'

import { PlotbandPlotlineComponent } from './plotband-plotline.component'

@NgModule({
  imports: [VisXYContainerModule, VisLineModule, VisAxisModule, VisPlotbandModule, VisPlotlineModule],
  declarations: [PlotbandPlotlineComponent],
  exports: [PlotbandPlotlineComponent],
})
export class PlotbandPlotlineModule { }
