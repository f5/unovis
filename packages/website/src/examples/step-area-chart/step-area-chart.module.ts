import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisAreaModule, VisAxisModule, VisBulletLegendModule } from '@unovis/angular'

import { StepAreaChartComponent } from './step-area-chart.component'

@NgModule({
  imports: [VisXYContainerModule, VisAreaModule, VisAxisModule, VisBulletLegendModule],
  declarations: [StepAreaChartComponent],
  exports: [StepAreaChartComponent],
})
export class StepAreaChartModule { }
