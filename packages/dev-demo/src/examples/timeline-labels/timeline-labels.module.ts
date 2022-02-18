// // Copyright (c) Volterra, Inc. All rights reserved.
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  VisXYContainerModule,
  VisAreaModule,
  VisLineModule,
  VisAxisModule,
  VisTooltipModule,
  VisCrosshairModule,
  VisFreeBrushModule,
  VisXYLabelsModule,
  VisBulletLegendModule,
  VisTimelineModule,
} from '@volterra/vis-angular'

import { TimelineLabelsComponent } from './timeline-labels.component'

@NgModule({
  imports: [CommonModule, VisXYContainerModule, VisAreaModule, VisLineModule, VisAxisModule, VisCrosshairModule,
    VisTooltipModule, VisFreeBrushModule, VisXYLabelsModule, VisBulletLegendModule, VisTimelineModule],
  declarations: [TimelineLabelsComponent],
  exports: [TimelineLabelsComponent],
})
export class TimelineLabelsModule { }
