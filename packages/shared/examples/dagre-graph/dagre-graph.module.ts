import { NgModule } from '@angular/core'
import { VisSingleContainerModule, VisGraphModule } from '@unovis/angular'

import { BasicGraphComponent } from './dagre-graph.component'

@NgModule({
  imports: [VisSingleContainerModule, VisGraphModule],
  declarations: [BasicGraphComponent],
  exports: [BasicGraphComponent],
})
export class BasicGraphModule { }
