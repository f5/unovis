//
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  VisAxisModule,
  VisBrushModule,
  VisCrosshairModule,
  VisFreeBrushModule,
  VisSankeyModule,
  VisSingleContainerModule,
  VisTimelineModule,
  VisTooltipModule,
  VisXYContainerModule,
} from '@unovis/angular'

import { SankeyThreatCampaignsComponent } from './sankey-threat-campaigns.component'


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    VisSingleContainerModule,
    VisSankeyModule,
    VisXYContainerModule,
    VisTimelineModule,
    VisCrosshairModule,
    VisAxisModule,
    VisTooltipModule,
    VisBrushModule,
    VisFreeBrushModule,
  ],
  declarations: [SankeyThreatCampaignsComponent],
  exports: [SankeyThreatCampaignsComponent],
})
export class SankeyThreatCampaignsModule { }
