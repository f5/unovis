import { NgModule } from '@angular/core'
import { VisSingleContainerModule, VisSankeyModule } from '@unovis/angular'

import { ExpandableSankeyComponent } from './expandable-sankey.component'

@NgModule({
  imports: [VisSingleContainerModule, VisSankeyModule],
  declarations: [ExpandableSankeyComponent],
  exports: [ExpandableSankeyComponent],
})
export class ExpandableSankeyModule { }
