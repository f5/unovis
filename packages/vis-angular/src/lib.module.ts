// Copyright (c) Volterra, Inc. All rights reserved.
import { NgModule } from '@angular/core'

// SVG Container Components
import { VisXYContainerComponent, VisSingleContainerComponent } from './containers'

// Ancillary Components
import { VisTooltipComponent } from './core/tooltip/tooltip.component'

// HTML Components
import { VisLeafletMapComponent } from './html-components/leaflet-map/leaflet-map.component'

// Auto-generated SVG components
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
import { VisTopoJSONMapComponent } from './components/topojson-map/topojson-map.component'
import { VisSankeyComponent } from './components/sankey/sankey.component'

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
    VisTopoJSONMapComponent,
    VisSankeyComponent,
    VisLeafletMapComponent,
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
    VisTopoJSONMapComponent,
    VisSankeyComponent,
    VisLeafletMapComponent,
  ],
})
export class VisAngularModule { }
