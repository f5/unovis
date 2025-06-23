/* This file is for the Angular Gallery Viewer only. See package.json -> scripts -> gallery:angular */
import { NgModule, Component } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { BrowserModule } from '@angular/platform-browser'

// Area
import { NonStackedAreaChartModule } from '@unovis/shared/examples/non-stacked-area-chart/non-stacked-area-chart.module'
import { StackedAreaModule } from '@unovis/shared/examples/stacked-area-chart/stacked-area-chart.module'
import { StackedAreaWithAttributesModule } from '@unovis/shared/examples/stacked-area-chart-with-attributes/stacked-area-chart-with-attributes.module'
import { StepAreaChartModule } from '@unovis/shared/examples/step-area-chart/step-area-chart.module'

// Bars
import { BasicGroupedBarModule } from '@unovis/shared/examples/basic-grouped-bar/basic-grouped-bar.module'
import { StackedBarChartModule } from '@unovis/shared/examples/horizontal-stacked-bar-chart/horizontal-stacked-bar-chart.module'

// Line
import { BasicLineChartModule } from '@unovis/shared/examples/basic-line-chart/basic-line-chart.module'
import { MultiLineChartModule } from '@unovis/shared/examples/multi-line-chart/multi-line-chart.module'
import { DataGapLineChartModule } from '@unovis/shared/examples/data-gap-line-chart/data-gap-line-chart.module'
import { PatchyLineChartModule } from '@unovis/shared/examples/patchy-line-chart/patchy-line-chart.module'

// Timeline
import { BasicTimelineModule } from '@unovis/shared/examples/basic-timeline/basic-timeline.module'

// Scatter
import { BasicScatterPlotModule } from '@unovis/shared/examples/basic-scatter-plot/basic-scatter-plot.module'
import { SizedScatterPlotModule } from '@unovis/shared/examples/sized-scatter-plot/sized-scatter-plot.module'

// Maps
import { BasicLeafletMapModule } from '@unovis/shared/examples/basic-leaflet-map/basic-leaflet-map.module'
import { LeafletFlowMapModule } from '@unovis/shared/examples/leaflet-flow-map/leaflet-flow-map.module'
import { AdvancedLeafletMapModule } from '@unovis/shared/examples/advanced-leaflet-map/advanced-leaflet-map.module'
// Todo: Current app configuration doesn't work for `@unovis/ts/maps` imports so the example below throws errors
import { TopojsonMapModule } from '@unovis/shared/examples/topojson-map/topojson-map.module'

// Sankey
import { BasicSankeyModule } from '@unovis/shared/examples/basic-sankey/basic-sankey.module'
import { ExpandableSankeyModule } from '@unovis/shared/examples/expandable-sankey/expandable-sankey.module'

// Graph
import { BasicGraphModule } from '@unovis/shared/examples/dagre-graph/dagre-graph.module'
import { ForceLayoutGraphModule } from '@unovis/shared/examples/force-graph/force-graph.module'
import { ParallelLayoutGraphModule } from '@unovis/shared/examples/parallel-graph/parallel-graph.module'
import { ElkLayeredGraphModule } from '@unovis/shared/examples/elk-layered-graph/elk-layered-graph.module'


// Nested Donut
import { SunburstChartModule } from '@unovis/shared/examples/sunburst-nested-donut/sunburst-nested-donut.module'

// Auxiliary
import { CrosshairStackedBarModule } from '@unovis/shared/examples/crosshair-stacked-bar/crosshair-stacked-bar.module'
import { BrushGroupedBarModule } from '@unovis/shared/examples/brush-grouped-bar/brush-grouped-bar.module'
import { FreeBrushScattersModule } from '@unovis/shared/examples/free-brush-scatters/free-brush-scatters.module'
import { BaselineAreaChartModule } from '@unovis/shared/examples/baseline-area-chart/baseline-area-chart.module'
import { PlotbandPlotlineModule } from '@unovis/shared/examples/plotband-plotline/plotband-plotline.module'

@Component({
  selector: 'app-component',
  template: `
    <!-- Area -->
    <stacked-area-chart></stacked-area-chart>
    <stacked-area-chart-with-attributes></stacked-area-chart-with-attributes>
    <non-stacked-area-chart></non-stacked-area-chart>
    <baseline-area-chart></baseline-area-chart>
    <step-area-chart></step-area-chart>

    <!-- Bars -->
    <basic-grouped-bar></basic-grouped-bar>
    <horizontal-stacked-bar-chart></horizontal-stacked-bar-chart>

    <!-- Line -->
    <basic-line-chart></basic-line-chart>
    <multi-line-chart></multi-line-chart>
    <data-gap-line-chart></data-gap-line-chart>
    <patchy-line-chart></patchy-line-chart>

    <!-- Timeline -->
    <basic-timeline></basic-timeline>

    <!-- Scatter -->
    <basic-scatter-plot></basic-scatter-plot>
    <sized-scatter-plot></sized-scatter-plot>

    <!-- Maps -->
    <basic-leaflet-map></basic-leaflet-map>
    <leaflet-flow-map></leaflet-flow-map>
    <topojson-map></topojson-map>
    <advanced-leaflet-map></advanced-leaflet-map>

    <!-- Sankey -->
    <basic-sankey></basic-sankey>
    <expandable-sankey></expandable-sankey>

    <!-- Graph -->
    <dagre-graph></dagre-graph>
    <force-graph></force-graph>
    <parallel-graph></parallel-graph>
    <elk-graph></elk-graph>

    <!-- Nested Donut -->
    <sunburst-nested-donut></sunburst-nested-donut>

    <!-- Auxiliary -->
    <crosshair-stacked-bar></crosshair-stacked-bar>
    <brush-grouped-bar></brush-grouped-bar>
    <free-brush-scatters ></free-brush-scatters>
    <plotband-plotline ></plotband-plotline>
  `,
})
export class AppComponent {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor () {
  }
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, BasicGroupedBarModule, BasicLeafletMapModule, BasicLineChartModule, MultiLineChartModule,
    TopojsonMapModule, StackedBarChartModule, BrushGroupedBarModule, BasicScatterPlotModule, SizedScatterPlotModule, FreeBrushScattersModule, NonStackedAreaChartModule,
    BasicTimelineModule, BasicSankeyModule, ExpandableSankeyModule, BasicGraphModule, LeafletFlowMapModule,
    ForceLayoutGraphModule, AdvancedLeafletMapModule, StackedAreaModule, StackedAreaWithAttributesModule, ParallelLayoutGraphModule, ElkLayeredGraphModule,
    DataGapLineChartModule, CrosshairStackedBarModule, BaselineAreaChartModule, StepAreaChartModule, SunburstChartModule, PlotbandPlotlineModule, PatchyLineChartModule
  ],
  bootstrap: [AppComponent],
  providers: [BrowserModule],
})
export class AppModule {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor () {}
}

platformBrowserDynamic().bootstrapModule(AppModule)
