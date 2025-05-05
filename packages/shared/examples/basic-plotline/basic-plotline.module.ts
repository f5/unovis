import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisLineModule, VisAxisModule, VisPlotlineModule } from '@unovis/angular'

import { BasicPlotlineComponent } from './basic-plotline.component'

@NgModule({
  imports: [VisXYContainerModule, VisLineModule, VisAxisModule, VisPlotlineModule],
  declarations: [BasicPlotlineComponent],
  exports: [BasicPlotlineComponent],
})
export class BasicPlotlineModule { }
