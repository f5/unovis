// Copyright (c) Volterra, Inc. All rights reserved.

import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { ScatterComponent } from 'examples/scatter/scatter.component'
import { LineComponent } from 'examples/line/line.component'
import { StackedBarComponent } from 'examples/stacked-bar/stacked-bar.component'
import { SingleComponent } from 'examples/single/single.component'
import { CompositeComponent } from 'examples/composite/composite.component'
import { SankeyComponent } from 'examples/sankey/sankey.component'
import { WrapperUsageExampleComponent } from 'examples/wrapper-usage-example/wrapper-usage-example.component'
import { TimelineComponent } from 'examples/timeline/timeline.component'
import { AreaCompositeComponent } from 'examples/area-composite/area-composite.component'
import { SimpleMapComponent } from 'examples/simple-map/simple-map.component'
import { MapComponent } from 'examples/map/map.component'

import { AppComponent } from './app.component'
import { BulletLegendComponent } from './components/bullet-legend/bullet-legend.component'
import { FlowLegendComponent } from './components/flow-legend/flow-legend.component'
import { XYChartComponent } from './components/xychart/xychart.component'
import { MapLeafletComponent } from './components/map-leaflet/map-leaflet.component'

const appRoutes: Routes = [
  { path: 'scatter', component: ScatterComponent },
  { path: 'line', component: LineComponent },
  { path: 'stacked-bar', component: StackedBarComponent },
  { path: 'single', component: SingleComponent },
  { path: 'composite', component: CompositeComponent },
  { path: 'sankey', component: SankeyComponent },
  { path: 'wrapper-usage-example', component: WrapperUsageExampleComponent },
  { path: 'timeline', component: TimelineComponent },
  { path: 'area-composite', component: AreaCompositeComponent },
  { path: 'simplemap', component: SimpleMapComponent },
  { path: 'map', component: MapComponent },
]

@NgModule({
  declarations: [
    AppComponent,
    ScatterComponent,
    LineComponent,
    StackedBarComponent,
    SingleComponent,
    CompositeComponent,
    BulletLegendComponent,
    FlowLegendComponent,
    SankeyComponent,
    XYChartComponent,
    WrapperUsageExampleComponent,
    TimelineComponent,
    AreaCompositeComponent,
    SimpleMapComponent,
    MapComponent,
    MapLeafletComponent,
  ],

  imports: [
    RouterModule.forRoot(
      appRoutes
    ),
    BrowserModule,
  ],

  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
