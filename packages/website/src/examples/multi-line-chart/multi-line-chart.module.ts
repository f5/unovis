import { NgModule } from '@angular/core'
import { VisBulletLegendModule, VisLineModule, VisXYContainerModule } from '@volterra/vis-angular'

import { MultiLineChartComponent } from './multi-line-chart.component'

@NgModule({
  imports: [VisXYContainerModule, VisLineModule, VisBulletLegendModule],
  declarations: [MultiLineChartComponent],
  exports: [MultiLineChartComponent],
})
export class MultiLineChartModule { }
