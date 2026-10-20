import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VisAxisModule, VisBulletLegendModule, VisPlotlineModule, VisTimelineModule, VisTooltipModule, VisXYContainerModule } from '@unovis/angular'
import { PythonReleaseTimelineComponent } from './python-release-timeline.component'

@NgModule({
  imports: [
    CommonModule,
    VisAxisModule,
    VisBulletLegendModule,
    VisPlotlineModule,
    VisTimelineModule,
    VisTooltipModule,
    VisXYContainerModule,
  ],
  declarations: [PythonReleaseTimelineComponent],
  exports: [PythonReleaseTimelineComponent],
})
export class PythonReleaseTimelineModule {}
