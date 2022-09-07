import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisTimelineModule, VisAxisModule, VisBulletLegendModule, VisTooltipModule } from '@unovis/angular'

import { BasicTimelineComponent } from './basic-timeline.component'

@NgModule({
  imports: [VisXYContainerModule, VisTimelineModule, VisAxisModule, VisBulletLegendModule, VisTooltipModule],
  declarations: [BasicTimelineComponent],
  exports: [BasicTimelineComponent],
})
export class BasicTimelineModule { }
