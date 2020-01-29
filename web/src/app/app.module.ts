// Copyright (c) Volterra, Inc. All rights reserved.

import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { SingleComponent } from 'examples/single/single.component'
import { CompositeComponent } from 'examples/composite/composite.component'
import { WrapperUsageExampleComponent } from 'examples/wrapper-usage-example/wrapper-usage-example.component'
import { TimelineComponent } from 'examples/timeline/timeline.component'

import { AppComponent } from './app.component'
import { BulletLegendComponent } from './components/bullet-legend/bullet-legend.component'
import { XYChartComponent } from './components/xychart/xychart.component'

const appRoutes: Routes = [
  { path: 'single', component: SingleComponent },
  { path: 'composite', component: CompositeComponent },
  { path: 'wrapper-usage-example', component: WrapperUsageExampleComponent },
  { path: 'timeline', component: TimelineComponent },
]

@NgModule({
  declarations: [
    AppComponent,
    SingleComponent,
    CompositeComponent,
    BulletLegendComponent,
    XYChartComponent,
    WrapperUsageExampleComponent,
    TimelineComponent,
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
