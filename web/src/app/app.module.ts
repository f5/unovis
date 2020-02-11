// Copyright (c) Volterra, Inc. All rights reserved.

import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { SingleComponent } from 'examples/single/single.component'
import { CompositeComponent } from 'examples/composite/composite.component'
import { SankeyComponent } from 'examples/sankey/sankey.component'
import { WrapperUsageExampleComponent } from 'examples/wrapper-usage-example/wrapper-usage-example.component'
import { TimelineComponent } from 'examples/timeline/timeline.component'
import { AreaCompositeComponent } from 'examples/area-composite/area-composite.component'

import { AppComponent } from './app.component'
import { BulletLegendComponent } from './components/bullet-legend/bullet-legend.component'
import { FlowLegendComponent } from './components/flow-legend/flow-legend.component'
import { XYChartComponent } from './components/xychart/xychart.component'

const appRoutes: Routes = [
  { path: 'single', component: SingleComponent },
  { path: 'composite', component: CompositeComponent },
  { path: 'sankey', component: SankeyComponent },
  { path: 'wrapper-usage-example', component: WrapperUsageExampleComponent },
  { path: 'timeline', component: TimelineComponent },
  { path: 'area-composite', component: AreaCompositeComponent },
]

@NgModule({
  declarations: [
    AppComponent,
    SingleComponent,
    CompositeComponent,
    BulletLegendComponent,
    FlowLegendComponent,
    SankeyComponent,
    XYChartComponent,
    WrapperUsageExampleComponent,
    TimelineComponent,
    AreaCompositeComponent,
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
