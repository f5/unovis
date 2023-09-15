import { NgModule } from '@angular/core'
import { VisSingleContainerModule, VisNestedDonutModule } from '@unovis/angular'

import { SunburstChartComponent } from './sunburst-nested-donut.component'

@NgModule({
  imports: [VisSingleContainerModule, VisNestedDonutModule],
  declarations: [SunburstChartComponent],
  exports: [SunburstChartComponent],
})
export class SunburstChartModule { }
