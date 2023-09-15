import { NgModule } from '@angular/core'
import { VisSingleContainerModule, VisGraphModule } from '@unovis/angular'

import { ElkLayeredGraphComponent } from './elk-layered-graph.component'

@NgModule({
  imports: [VisSingleContainerModule, VisGraphModule],
  declarations: [ElkLayeredGraphComponent],
  exports: [ElkLayeredGraphComponent],
})
export class ElkLayeredGraphModule { }
