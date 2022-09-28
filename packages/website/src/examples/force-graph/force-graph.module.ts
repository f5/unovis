import { NgModule } from '@angular/core'
import { VisSingleContainerModule, VisGraphModule } from '@unovis/angular'

import { ForceLayoutGraphComponent } from './force-graph.component'

@NgModule({
  imports: [VisSingleContainerModule, VisGraphModule],
  declarations: [ForceLayoutGraphComponent],
  exports: [ForceLayoutGraphComponent],
})
export class ForceLayoutGraphModule { }
