import { NgModule } from '@angular/core'
import { VisSingleContainerModule, VisGraphModule, VisTooltipModule, VisBulletLegendModule } from '@unovis/angular'

import { ParallelGraphComponent } from './parallel-graph.component'

@NgModule({
  imports: [VisSingleContainerModule, VisGraphModule, VisTooltipModule, VisBulletLegendModule],
  declarations: [ParallelGraphComponent],
  exports: [ParallelGraphComponent],
})
export class ParallelGraphModule { }
