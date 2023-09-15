import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisLineModule, VisAxisModule } from '@unovis/angular'

import { BasicLineChartComponent } from './basic-line-chart.component'

@NgModule({
  imports: [VisXYContainerModule, VisLineModule, VisAxisModule],
  declarations: [BasicLineChartComponent],
  exports: [BasicLineChartComponent],
})
export class BasicLineChartModule { }
