import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisLineModule, VisAxisModule, VisXYLabelsModule, VisBulletLegendModule } from '@unovis/angular'

import { DataGapLineChartComponent } from './data-gap-line-chart.component'

@NgModule({
  imports: [VisXYContainerModule, VisLineModule, VisAxisModule, VisXYLabelsModule, VisBulletLegendModule],
  declarations: [DataGapLineChartComponent],
  exports: [DataGapLineChartComponent],
})
export class DataGapLineChartModule { }
