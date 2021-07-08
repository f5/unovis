// Copyright (c) Volterra, Inc. All rights reserved.
import { NgModule } from '@angular/core'
import { VisXYContainerComponent } from './containers'
import { VisLineComponent } from './components/line/line.directive'
import { VisAreaComponent } from './components/area/area.directive'
import { VisAxisComponent } from './components/axis/axis.directive'
import { VisBrushComponent } from './components/brush/brush.directive'
import { VisFreeBrushComponent } from './components/free-brush/free-brush.directive'
import { VisCrosshairComponent } from './components/crosshair/crosshair.directive'
import { VisDonutComponent } from './components/donut/donut.directive'
import { VisGroupedBarComponent } from './components/grouped-bar/grouped-bar.directive'
import { VisScatterComponent } from './components/scatter/scatter.directive'
import { VisStackedBarComponent } from './components/stacked-bar/stacked-bar.directive'
import { VisTimelineComponent } from './components/timeline/timeline.directive'

@NgModule({
  declarations: [
    VisXYContainerComponent,
    VisLineComponent,
    VisAreaComponent,
    VisAxisComponent,
    VisBrushComponent,
    VisFreeBrushComponent,
    VisCrosshairComponent,
    VisDonutComponent,
    VisGroupedBarComponent,
    VisScatterComponent,
    VisStackedBarComponent,
    VisTimelineComponent,
  ],
  imports: [
  ],
  exports: [
    VisXYContainerComponent,
    VisLineComponent,
    VisAreaComponent,
    VisAxisComponent,
    VisBrushComponent,
    VisFreeBrushComponent,
    VisCrosshairComponent,
    VisDonutComponent,
    VisGroupedBarComponent,
    VisScatterComponent,
    VisStackedBarComponent,
    VisTimelineComponent,
  ],
})
export class VisAngularModule { }
