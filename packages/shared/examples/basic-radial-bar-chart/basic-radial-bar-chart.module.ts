import { NgModule } from '@angular/core'
import { VisSingleContainerModule, VisRadialBarModule, VisBulletLegendModule, VisTooltipModule } from '@unovis/angular'

import { BasicRadialBarChartComponent } from './basic-radial-bar-chart.component'

@NgModule({
  imports: [VisSingleContainerModule, VisRadialBarModule, VisBulletLegendModule, VisTooltipModule],
  declarations: [BasicRadialBarChartComponent],
  exports: [BasicRadialBarChartComponent],
})
export class BasicRadialBarChartModule { }
