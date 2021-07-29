// Copyright (c) Volterra, Inc. All rights reserved.
import { NgModule } from '@angular/core'
import { VisXYContainerComponent, VisSingleContainerComponent } from './containers'
import { VisTooltipComponent } from './core/tooltip/tooltip.component'

// Auto-generated components
import { VisLineComponent } from './components/line/line.component'
import { VisAreaComponent } from './components/area/area.component'
import { VisAxisComponent } from './components/axis/axis.component'
import { VisBrushComponent } from './components/brush/brush.component'
import { VisFreeBrushComponent } from './components/free-brush/free-brush.component'
import { VisCrosshairComponent } from './components/crosshair/crosshair.component'
import { VisDonutComponent } from './components/donut/donut.component'
import { VisGroupedBarComponent } from './components/grouped-bar/grouped-bar.component'
import { VisScatterComponent } from './components/scatter/scatter.component'
import { VisStackedBarComponent } from './components/stacked-bar/stacked-bar.component'
import { VisTimelineComponent } from './components/timeline/timeline.component'

@NgModule({
  declarations: [
    VisXYContainerComponent,
    VisSingleContainerComponent,
    VisTooltipComponent,
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
    VisSingleContainerComponent,
    VisTooltipComponent,
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
