import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VisRollingPinLegendModule, VisHeatmapModule, VisSingleContainerModule, VisTooltipModule } from '@unovis/angular'
import { BikeDemandHeatmapComponent } from './bike-demand-heatmap.component'

@NgModule({
  imports: [CommonModule, VisRollingPinLegendModule, VisHeatmapModule, VisSingleContainerModule, VisTooltipModule],
  declarations: [BikeDemandHeatmapComponent],
  exports: [BikeDemandHeatmapComponent],
})
export class BikeDemandHeatmapModule {}
