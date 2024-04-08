import { NgModule } from '@angular/core'
import { VisSingleContainerModule, VisDonutModule, VisBulletLegendModule } from '@unovis/angular'

import { BasicDonutChartComponent } from './basic-donut-chart.component'

@NgModule({
  imports: [VisSingleContainerModule, VisDonutModule, VisBulletLegendModule],
  declarations: [BasicDonutChartComponent],
  exports: [BasicDonutChartComponent],
})
export class BasicDonutChartModule { }
