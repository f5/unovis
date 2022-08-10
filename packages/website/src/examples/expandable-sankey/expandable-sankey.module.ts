import { NgModule } from '@angular/core'
import { VisSingleContainerModule, VisSankeyModule } from '@volterra/vis-angular'

import { ExpandableSankeyComponent } from './expandable-sankey.component'

@NgModule({
  imports: [VisSingleContainerModule, VisSankeyModule],
  declarations: [ExpandableSankeyComponent],
  exports: [BasicSankeyComponent],
})
export class ExpandableSankeyModule { }
