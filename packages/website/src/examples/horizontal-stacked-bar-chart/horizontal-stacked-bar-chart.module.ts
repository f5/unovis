import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisStackedBarModule, VisAxisModule } from '@volterra/vis-angular'

import { StackedBarChartComponent } from './stacked-bar-chart.component'

@NgModule({
  imports: [VisXYContainerModule, VisStackedBarModule, VisAxisModule],
  declarations: [StackedBarChartComponent],
  exports: [StackedBarChartComponent],
})
export class StackedBarChartModule { }
