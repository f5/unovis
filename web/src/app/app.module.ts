// Copyright (c) Volterra, Inc. All rights reserved.

import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'

import { ScatterComponent } from 'examples/scatter/scatter.component'
import { LineComponent } from 'examples/line/line.component'
import { StackedBarComponent } from 'examples/stacked-bar/stacked-bar.component'
import { GroupedBarComponent } from 'examples/grouped-bar/grouped-bar.component'
import { AreaComponent } from 'examples/area/area.component'
import { SankeyComponent } from 'examples/sankey/sankey.component'
import { CompositeComponent } from 'examples/composite/composite.component'
import { WrapperUsageExampleComponent } from 'examples/wrapper-usage-example/wrapper-usage-example.component'
import { TimelineComponent } from 'examples/timeline/timeline.component'
import { BulletLegendExampleComponent } from 'examples/bullet-legend/bullet-legend.component'
import { SimpleMapComponent } from 'examples/simple-map/simple-map.component'
import { MapComponent } from 'examples/map/map.component'
import { RadialDendrogramComponent } from 'examples/radial-dendrogram/radial-dendrogram.component'
import { GraphComponent } from 'examples/graph/graph.component'
import { GraphPanelsComponent } from 'examples/graph-panels/graph-panels.component'
import { ConnectivityGraphComponent } from 'examples/console-connectivity-graph/console-connectivity-graph.component'
import { TrafficGraphComponent } from 'examples/console-traffic-graph-pg2/console-traffic-graph-pg2.component'
import { ChordDiagramComponent } from 'examples/chord-diagram/chord-diagram.component'

import { AppComponent } from './app.component'
import { BulletLegendComponent } from './components/bullet-legend/bullet-legend.component'
import { FlowLegendComponent } from './components/flow-legend/flow-legend.component'
import { XYChartComponent } from './components/xychart/xychart.component'
import { MapLeafletComponent } from './components/map-leaflet/map-leaflet.component'
import { SingleChartComponent } from './components/singlechart/singlechart.component'
import { Collection } from './components/collection/collection.component'

const appRoutes: Routes = [
  { path: 'map', component: MapComponent },
  { path: 'scatter', component: ScatterComponent },
  { path: 'line', component: LineComponent },
  { path: 'stacked-bar', component: StackedBarComponent },
  { path: 'grouped-bar', component: GroupedBarComponent },
  { path: 'area', component: AreaComponent },
  { path: 'sankey', component: SankeyComponent },
  { path: 'composite', component: CompositeComponent },
  { path: 'wrapper-usage-example', component: WrapperUsageExampleComponent },
  { path: 'timeline', component: TimelineComponent },
  { path: 'bullet-legend', component: BulletLegendExampleComponent },
  { path: 'simplemap', component: SimpleMapComponent },
  { path: 'radial-dendrogram', component: RadialDendrogramComponent },
  { path: 'graph', component: GraphComponent },
  { path: 'graph-panels', component: GraphPanelsComponent },
  { path: 'connectivity-graph', component: ConnectivityGraphComponent },
  { path: 'traffic-graph', component: TrafficGraphComponent },
  { path: 'chord-diagram', component: ChordDiagramComponent },
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
    XYChartComponent,
    SingleChartComponent,
    WrapperUsageExampleComponent,
    TimelineComponent,
    BulletLegendExampleComponent,
    SimpleMapComponent,
    MapComponent,
    MapLeafletComponent,
    Collection,
    RadialDendrogramComponent,
    GraphComponent,
    GraphPanelsComponent,
    ConnectivityGraphComponent,
    TrafficGraphComponent,
    ChordDiagramComponent,
  ],

  imports: [
    RouterModule.forRoot(
      appRoutes
    ),
    BrowserModule,
    NoopAnimationsModule,
    MatButtonModule,
  ],

  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
