import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VisSingleContainerModule, VisGraphModule, VisTooltipModule } from '@unovis/angular'
import { CustomNodesGraphComponent } from './custom-nodes-graph.component'


@NgModule({
  imports: [
    VisSingleContainerModule,
    VisGraphModule,
    VisTooltipModule,
    CommonModule,
  ],
  declarations: [CustomNodesGraphComponent],
  exports: [CustomNodesGraphComponent],
})
export class CustomNodesGraphModule { }
