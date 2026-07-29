import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisAxisModule, VisStackedBarModule, VisTooltipModule } from '@unovis/angular'

import { WaterfallChartComponent } from './waterfall-chart.component'

@NgModule({
  imports: [VisXYContainerModule, VisStackedBarModule, VisAxisModule, VisTooltipModule],
  declarations: [WaterfallChartComponent],
  exports: [WaterfallChartComponent],
})
export class WaterfallChartModule { }
