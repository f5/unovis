import { SankeyLoginFlowComponent } from 'examples/sankey-login-flow/sankey-login-flow.component'
import { NgModule } from '@angular/core'
import { VisSingleContainerModule, VisSankeyModule } from '@volterra/vis-angular'

@NgModule({
  imports: [VisSingleContainerModule, VisSankeyModule],
  declarations: [SankeyLoginFlowComponent],
  exports: [SankeyLoginFlowComponent],
})
export class SankeyLoginFlowModule { }
