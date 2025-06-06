import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisLineModule, VisAxisModule, VisPlotbandModule } from '@unovis/angular'

import { BasicPlotbandComponent } from './basic-plotband.component'

@NgModule({
  imports: [VisXYContainerModule, VisLineModule, VisAxisModule, VisPlotbandModule],
  declarations: [BasicPlotbandComponent],
  exports: [BasicPlotbandComponent],
})
export class BasicPlotbandModule { }
