import { NgModule } from '@angular/core'
import { VisSingleContainerModule, VisGraphModule } from '@unovis/angular'

import { ParallelGraphComponent } from './parallel-graph.component'

@NgModule({
  imports: [VisSingleContainerModule, VisGraphModule],
  declarations: [ParallelGraphComponent],
  exports: [ParallelGraphComponent],
})
export class ParallelLayoutGraphModule { }
