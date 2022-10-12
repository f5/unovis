import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisAxisModule, VisBulletLegendModule, VisAreaModule } from '@unovis/angular'

import { BaselineAreaChartComponent } from './baseline-area-chart.component'

@NgModule({
  imports: [VisXYContainerModule, VisAreaModule, VisAxisModule, VisBulletLegendModule],
  declarations: [BaselineAreaChartComponent],
  exports: [BaselineAreaChartComponent],
})
export class BaselineAreaChartModule { }
