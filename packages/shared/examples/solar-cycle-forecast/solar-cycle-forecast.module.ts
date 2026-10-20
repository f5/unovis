import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  VisAreaModule,
  VisAxisModule,
  VisBrushModule,
  VisBulletLegendModule,
  VisCrosshairModule,
  VisLineModule,
  VisPlotlineModule,
  VisTooltipModule,
  VisXYContainerModule,
} from '@unovis/angular'
import { SolarCycleForecastComponent } from './solar-cycle-forecast.component'

@NgModule({
  imports: [
    CommonModule,
    VisAreaModule,
    VisAxisModule,
    VisBrushModule,
    VisBulletLegendModule,
    VisCrosshairModule,
    VisLineModule,
    VisPlotlineModule,
    VisTooltipModule,
    VisXYContainerModule,
  ],
  declarations: [SolarCycleForecastComponent],
  exports: [SolarCycleForecastComponent],
})
export class SolarCycleForecastModule {}
