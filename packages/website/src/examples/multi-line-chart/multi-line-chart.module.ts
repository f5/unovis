import { NgModule } from '@angular/core'
import { VisBulletLegendModule, VisLineModule, VisXYContainerModule, VisAxisModule } from '@unovis/angular'

import { MultiLineChartComponent } from './multi-line-chart.component'

@NgModule({
  imports: [VisXYContainerModule, VisLineModule, VisBulletLegendModule, VisAxisModule],
  declarations: [MultiLineChartComponent],
  exports: [MultiLineChartComponent],
})
export class MultiLineChartModule { }
