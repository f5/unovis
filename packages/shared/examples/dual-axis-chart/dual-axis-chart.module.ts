import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisAxisModule, VisBulletLegendModule, VisAreaModule } from '@unovis/angular'

import { DualAxisChartComponent } from './dual-axis-chart.component'

@NgModule({
  imports: [VisXYContainerModule, VisAreaModule, VisAxisModule, VisBulletLegendModule],
  declarations: [DualAxisChartComponent],
  exports: [DualAxisChartComponent],
})
export class DualAxisChartModule { }
