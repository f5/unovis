import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisScatterModule, VisAxisModule, VisTooltipModule, VisBulletLegendModule } from '@unovis/angular'

import { BasicScatterChartComponent } from './basic-scatter-chart.component'

@NgModule({
  imports: [VisXYContainerModule, VisScatterModule, VisAxisModule, VisTooltipModule, VisBulletLegendModule],
  declarations: [BasicScatterChartComponent],
  exports: [BasicScatterChartComponent],
})
export class BasicScatterChartModule { }
