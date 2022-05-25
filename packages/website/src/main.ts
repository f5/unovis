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

@Component({
  selector: 'app-component',
  template: `
    <basic-grouped-bar></basic-grouped-bar>
    <basic-line-chart></basic-line-chart>
    <basic-leaflet-map></basic-leaflet-map>
    <multi-line-chart></multi-line-chart>
    <topojson-map></topojson-map>
    <horizontal-stacked-bar-chart></horizontal-stacked-bar-chart>
    <basic-scatter-chart></basic-scatter-chart>
    <free-brush-scatters ></free-brush-scatters>
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
    TopojsonMapModule, StackedBarChartModule, BasicScatterChartModule, FreeBrushScattersModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor () {}
}

platformBrowserDynamic().bootstrapModule(AppModule)
