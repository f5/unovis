/* This file is for the Angular Gallery Viewer only. See package.json -> scripts -> gallery:angular */
import 'zone.js'

import { NgModule, Component } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { BrowserModule } from '@angular/platform-browser'

import { BasicGroupedBarModule } from './examples/basic-grouped-bar/basic-grouped-bar.module'
import { BasicLeafletMapModule } from './examples/basic-leaflet-map/basic-leaflet-map.module'
import { BasicLineChartModule } from './examples/basic-line-chart/basic-line-chart.module'
import { MultiLineChartModule } from './examples/multi-line-chart/multi-line-chart.module'
import { TopojsonMapModule } from './examples/topojson-map/topojson-map.module'
import { StackedBarChartModule } from './examples/horizontal-stacked-bar-chart/horizontal-stacked-bar-chart.module'
import { BasicScatterChartModule } from './examples/basic-scatter-chart/basic-scatter-chart.module'
import { FreeBrushScattersModule } from './examples/free-brush-scatters/free-brush-scatters.module'
import { BrushGroupedBarModule } from './examples/brush-grouped-bar/brush-grouped-bar.module'
import { BasicAreaChartModule } from './examples/non-stacked-area-chart/non-stacked-area-chart.module'
import { StackedAreaModule } from './examples/stacked-area-chart/stacked-area-chart.module'
import { BasicTimelineModule } from './examples/basic-timeline/basic-timeline.module'
import { BasicSankeyModule } from './examples/basic-sankey/basic-sankey.module'
import { ExpandableSankeyModule } from './examples/expandable-sankey/expandable-sankey.module'
import { BasicGraphModule } from './examples/dagre-graph/dagre-graph.module'
import { LeafletFlowMapModule } from './examples/leaflet-flow-map/leaflet-flow-map.module'
import { ForceLayoutGraphModule } from './examples/force-graph/force-graph.module'
import { AdvancedLeafletMapModule } from './examples/advanced-leaflet-map/advanced-leaflet-map.module'
import { ParallelGraphModule } from './examples/parallel-graph/parallel-graph.module'

@Component({
  selector: 'app-component',
  template: `
    <basic-grouped-bar></basic-grouped-bar>
    <basic-line-chart></basic-line-chart>
    <basic-leaflet-map></basic-leaflet-map>
    <leaflet-flow-map></leaflet-flow-map>
    <advanced-leaflet-map></advanced-leaflet-map>
    <multi-line-chart></multi-line-chart>
    <topojson-map></topojson-map>
    <horizontal-stacked-bar-chart></horizontal-stacked-bar-chart>
    <basic-scatter-chart></basic-scatter-chart>
    <free-brush-scatters ></free-brush-scatters>
    <brush-grouped-bar></brush-grouped-bar>
    <non-stacked-area-chart></non-stacked-area-chart>
    <stacked-area-chart></stacked-area-chart>
    <basic-timeline></basic-timeline>
    <basic-sankey></basic-sankey>
    <expandable-sankey></expandable-sankey>
    <dagre-graph></dagre-graph>
<<<<<<< HEAD
    <force-graph></force-graph>
=======
<<<<<<< HEAD
    <force-layout-graph></force-layout-graph>
=======
    <parallel-graph></parallel-graph>
>>>>>>> 9f07a17c (Website | Gallery: Graph Parallel Layout example)
>>>>>>> 3057b5d5 (Website | Gallery: Graph Parallel Layout example)
  `,
})
export class AppComponent {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor () {}
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, BasicGroupedBarModule, BasicLeafletMapModule, BasicLineChartModule, MultiLineChartModule,
    TopojsonMapModule, StackedBarChartModule, BasicScatterChartModule, FreeBrushScattersModule, BrushGroupedBarModule,
<<<<<<< HEAD
    TopojsonMapModule, StackedBarChartModule, BasicScatterChartModule, FreeBrushScattersModule, BasicAreaChartModule,
    BasicTimelineModule, BasicSankeyModule, ExpandableSankeyModule, BasicGraphModule, LeafletFlowMapModule,
    ForceLayoutGraphModule, AdvancedLeafletMapModule, StackedAreaModule,
=======
    TopojsonMapModule, StackedBarChartModule, BasicScatterChartModule, FreeBrushScattersModule, BasicAreaModule,
<<<<<<< HEAD
    BasicTimelineModule, BasicSankeyModule, ExpandableSankeyModule, BasicGraphModule, LeafletFlowMapModule,
    ForceLayoutGraphModule, AdvancedLeafletMapModule,
=======
    BasicTimelineModule, BasicSankeyModule, ExpandableSankeyModule, BasicGraphModule,
    BasicTimelineModule, BasicSankeyModule, ExpandableSankeyModule, ParallelGraphModule,
>>>>>>> 9f07a17c (Website | Gallery: Graph Parallel Layout example)
>>>>>>> 3057b5d5 (Website | Gallery: Graph Parallel Layout example)
  ],
  bootstrap: [AppComponent],
  providers: [BrowserModule],
})
export class AppModule {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor () {}
}

platformBrowserDynamic().bootstrapModule(AppModule)
