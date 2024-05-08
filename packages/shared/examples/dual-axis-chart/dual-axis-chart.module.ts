import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisAxisModule, VisLineModule, VisAreaModule } from '@unovis/angular'

import { DualAxisChartComponent } from './dual-axis-chart.component'

@NgModule({
  imports: [VisXYContainerModule, VisAreaModule, VisAxisModule, VisLineModule],
  declarations: [DualAxisChartComponent],
  exports: [DualAxisChartComponent],
})
export class DualAxisChartModule { }
