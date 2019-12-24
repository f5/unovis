// Copyright (c) Volterra, Inc. All rights reserved.

import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { SingleComponent } from 'examples/single/single.component'
import { CompositeComponent } from 'examples/composite/composite.component'

import { AppComponent } from './app.component'

const appRoutes: Routes = [
  { path: 'single', component: SingleComponent },
  { path: 'composite', component: CompositeComponent },
]

@NgModule({
  declarations: [
    AppComponent,
    SingleComponent,
    CompositeComponent,
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
