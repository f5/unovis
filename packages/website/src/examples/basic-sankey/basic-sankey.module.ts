import { NgModule } from '@angular/core'
import { VisSingleContainerModule, VisSankeyModule } from '@volterra/vis-angular'

import { BasicSankeyComponent } from './basic-sankey.component'

@NgModule({
  imports: [VisSingleContainerModule, VisSankeyModule],
  declarations: [BasicSankeyComponent],
  exports: [BasicSankeyComponent],
})
export class BasicSankeyModule { }
