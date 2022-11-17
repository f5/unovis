import { NgModule } from '@angular/core'
import { VisSingleContainerModule, VisSankeyModule } from '@unovis/angular'

import { SankeyLoginFlowComponent } from './sankey-login-flow.component'
@NgModule({
  imports: [VisSingleContainerModule, VisSankeyModule],
  declarations: [SankeyLoginFlowComponent],
  exports: [SankeyLoginFlowComponent],
})
export class SankeyLoginFlowModule { }
