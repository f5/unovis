import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  VisAxisModule,
  VisBulletLegendModule,
  VisCrosshairModule,
  VisGroupedBarModule,
  VisLineModule,
  VisPlotlineModule,
  VisTooltipModule,
  VisXYContainerModule,
} from '@unovis/angular'
import { BikeTripDistributionsComponent } from './bike-trip-distributions.component'

@NgModule({
  imports: [
    CommonModule,
    VisAxisModule,
    VisBulletLegendModule,
    VisCrosshairModule,
    VisGroupedBarModule,
    VisLineModule,
    VisPlotlineModule,
    VisTooltipModule,
    VisXYContainerModule,
  ],
  declarations: [BikeTripDistributionsComponent],
  exports: [BikeTripDistributionsComponent],
})
export class BikeTripDistributionsModule {}
