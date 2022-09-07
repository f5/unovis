import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisStackedBarModule, VisAxisModule, VisTooltipModule, VisBulletLegendModule } from '@unovis/angular'

import { StackedBarChartComponent } from './horizontal-stacked-bar-chart.component'

@NgModule({
  imports: [VisXYContainerModule, VisStackedBarModule, VisAxisModule, VisTooltipModule, VisBulletLegendModule],
  declarations: [StackedBarChartComponent],
  exports: [StackedBarChartComponent],
})
export class StackedBarChartModule { }
