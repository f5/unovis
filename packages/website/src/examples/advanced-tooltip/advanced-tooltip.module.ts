import { NgModule } from '@angular/core'
import { VisAxisModule, VisCrosshairModule, VisXYContainerModule, VisStackedBarModule, VisTooltipModule } from '@unovis/angular'

import { CrosshairStackedBarComponent } from './advanced-tooltip.component'

@NgModule({
  imports: [VisAxisModule, VisCrosshairModule, VisXYContainerModule, VisStackedBarModule, VisTooltipModule],
  declarations: [CrosshairStackedBarComponent],
  exports: [CrosshairStackedBarComponent],
})
export class SparklineChartModule { }
