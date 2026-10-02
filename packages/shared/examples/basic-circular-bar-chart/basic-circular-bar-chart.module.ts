import { NgModule } from '@angular/core'
import { VisSingleContainerModule, VisCircularBarModule, VisBulletLegendModule, VisTooltipModule } from '@unovis/angular'

import { BasicCircularBarChartComponent } from './basic-circular-bar-chart.component'

@NgModule({
  imports: [VisSingleContainerModule, VisCircularBarModule, VisBulletLegendModule, VisTooltipModule],
  declarations: [BasicCircularBarChartComponent],
  exports: [BasicCircularBarChartComponent],
})
export class BasicCircularBarChartModule { }
