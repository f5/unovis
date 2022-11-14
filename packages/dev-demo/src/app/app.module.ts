import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { FormsModule } from '@angular/forms'

import { ScatterComponent } from '../examples/scatter/scatter.component'
import { LineComponent } from '../examples/line/line.component'
import { StackedBarComponent } from '../examples/stacked-bar/stacked-bar.component'
import { GroupedBarComponent } from '../examples/grouped-bar/grouped-bar.component'
import { AreaComponent } from '../examples/area/area.component'
import { SankeyComponent } from '../examples/sankey/sankey.component'
import { ApiEndpointExplorerComponent } from '../examples/api-endpoint-explorer/api-endpoint-explorer.component'
import { CompositeComponent } from '../examples/composite/composite.component'
import { WrapperUsageExampleComponent } from '../examples/wrapper-usage-example/wrapper-usage-example.component'
import { TimelineComponent } from '../examples/timeline/timeline.component'
import { BulletLegendExampleComponent } from '../examples/bullet-legend/bullet-legend.component'
import { TopoJSONMapComponent } from '../examples/topojson-map/topojson-map.component'
import { TopoJSONHeatMapComponent } from '../examples/topojson-heatmap/topojson-heatmap.component'
import { TopoJSONCountryMapsComponent } from '../examples/topojson-country-maps/topojson-country-maps.component'
import { MapComponent } from '../examples/map/map.component'
import { DDoSMapComponent } from '../examples/ddos-map/ddos-map.component'
import { PieMapComponent } from '../examples/pie-map/pie-map.component'
import { MapHeatmapComponent } from '../examples/map-heatmap/map-heatmap.component'
import { RadialDendrogramComponent } from '../examples/radial-dendrogram/radial-dendrogram.component'
import { GraphComponent } from '../examples/graph/graph.component'
import { ServiceGraphComponent } from '../examples/service-graph/service-graph.component'
import { ConnectivityGraphComponent } from '../examples/console-connectivity-graph/console-connectivity-graph.component'
import { TrafficGraphComponent } from '../examples/console-traffic-graph-pg2/console-traffic-graph-pg2.component'
import { ChordDiagramComponent } from '../examples/chord-diagram/chord-diagram.component'
import { DonutChartComponent } from '../examples/donut/donut.component'
import { AtomicAngularWrapperComponent } from '../examples/atomic-angular-wrapper/atomic-angular-wrapper.component'
import { FreeBrushComponent } from '../examples/free-brush/free-brush.component'
import { ConcentricGraphComponent } from '../examples/concentric-graph/concentric-graph.component'
import { HorizontalBarComponent } from '../examples/horizontal-bar/horizontal-bar.component'
import { TimelineLabelsComponent } from '../examples/timeline-labels/timeline-labels.component'
import { SankeyLoginFlowComponent } from '../examples/sankey-login-flow/sankey-login-flow.component'

import { AtomicAngularWrapperModule } from '../examples/atomic-angular-wrapper/atomic-angular-wrapper.module'
import { FreeBrushModule } from '../examples/free-brush/free-brush.module'
import { TimelineLabelsModule } from '../examples/timeline-labels/timeline-labels.module'
import { SankeyLoginFlowModule } from '../examples/sankey-login-flow/sankey-login-flow.module'
import { SankeyThreatCampaignsModule } from '../examples/sankey-campaign-threats/sankey-threat-campaigns.module'
import { SankeyThreatCampaignsComponent } from '../examples/sankey-campaign-threats/sankey-threat-campaigns.component'

import { AppComponent } from './app.component'
import { BulletLegendComponent } from './components/bullet-legend/bullet-legend.component'
import { FlowLegendComponent } from './components/flow-legend/flow-legend.component'
import { XYChartComponent } from './components/xychart/xychart.component'
import { MapLeafletComponent } from './components/map-leaflet/map-leaflet.component'
import { SingleContainerComponent } from './components/singlechart/singlechart.component'
import { Collection } from './components/collection/collection.component'
import { VisControlsComponent } from './components/vis-controls/vis-controls.component'

const appRoutes: Routes = [
  { path: 'map', component: MapComponent },
  { path: 'pie-map', component: PieMapComponent },
  { path: 'heatmap-map', component: MapHeatmapComponent },
  { path: 'ddos-map', component: DDoSMapComponent },
  { path: 'scatter', component: ScatterComponent },
  { path: 'line', component: LineComponent },
  { path: 'stacked-bar', component: StackedBarComponent },
  { path: 'grouped-bar', component: GroupedBarComponent },
  { path: 'horizontal-bar', component: HorizontalBarComponent },
  { path: 'area', component: AreaComponent },
  { path: 'sankey', component: SankeyComponent },
  { path: 'api-endpoint-explorer', component: ApiEndpointExplorerComponent },
  { path: 'composite', component: CompositeComponent },
  { path: 'wrapper-usage-example', component: WrapperUsageExampleComponent },
  { path: 'timeline', component: TimelineComponent },
  { path: 'timeline-with-labels', component: TimelineLabelsComponent },
  { path: 'bullet-legend', component: BulletLegendExampleComponent },
  { path: 'topojson-map', component: TopoJSONMapComponent },
  { path: 'topojson-heatmap', component: TopoJSONHeatMapComponent },
  { path: 'topojson-countries', component: TopoJSONCountryMapsComponent },
  { path: 'radial-dendrogram', component: RadialDendrogramComponent },
  { path: 'graph', component: GraphComponent },
  { path: 'concentric-graph', component: ConcentricGraphComponent },
  { path: 'force-graph', component: ServiceGraphComponent },
  { path: 'connectivity-graph', component: ConnectivityGraphComponent },
  { path: 'traffic-graph', component: TrafficGraphComponent },
  { path: 'chord-diagram', component: ChordDiagramComponent },
  { path: 'donut', component: DonutChartComponent },
  { path: 'atomic-angular-wrapper', component: AtomicAngularWrapperComponent },
  { path: 'free-brush', component: FreeBrushComponent },
  { path: 'sankey-login-flow', component: SankeyLoginFlowComponent },
  { path: 'sankey-threat-campaigns', component: SankeyThreatCampaignsComponent },
]

appRoutes.push({ path: '', redirectTo: `/${appRoutes[0].path}`, pathMatch: 'full' })

@NgModule({
  declarations: [
    AppComponent,
    ScatterComponent,
    LineComponent,
    StackedBarComponent,
    GroupedBarComponent,
    AreaComponent,
    CompositeComponent,
    BulletLegendComponent,
    FlowLegendComponent,
    SankeyComponent,
    ApiEndpointExplorerComponent,
    XYChartComponent,
    SingleContainerComponent,
    WrapperUsageExampleComponent,
    TimelineComponent,
    BulletLegendExampleComponent,
    TopoJSONMapComponent,
    TopoJSONHeatMapComponent,
    TopoJSONCountryMapsComponent,
    MapComponent,
    PieMapComponent,
    MapLeafletComponent,
    MapHeatmapComponent,
    DDoSMapComponent,
    Collection,
    RadialDendrogramComponent,
    GraphComponent,
    ServiceGraphComponent,
    ConnectivityGraphComponent,
    TrafficGraphComponent,
    ChordDiagramComponent,
    VisControlsComponent,
    DonutChartComponent,
    ConcentricGraphComponent,
    HorizontalBarComponent,
  ],

  imports: [
    RouterModule.forRoot(
      appRoutes
    ),
    BrowserModule,
    FormsModule,
    AtomicAngularWrapperModule,
    FreeBrushModule,
    TimelineLabelsModule,
    BrowserModule,
    SankeyLoginFlowModule,
    SankeyThreatCampaignsModule,
  ],

  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
