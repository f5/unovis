import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  VisAreaModule,
  VisAxisModule,
  VisBrushModule,
  VisBulletLegendModule,
  VisCrosshairModule,
  VisLineModule,
  VisTooltipModule,
  VisXYContainerModule,
} from '@unovis/angular'
import { ElectricityGridDashboardComponent } from './electricity-grid-dashboard.component'

@NgModule({
  imports: [
    CommonModule,
    VisAreaModule,
    VisAxisModule,
    VisBrushModule,
    VisBulletLegendModule,
    VisCrosshairModule,
    VisLineModule,
    VisTooltipModule,
    VisXYContainerModule,
  ],
  declarations: [ElectricityGridDashboardComponent],
  exports: [ElectricityGridDashboardComponent],
})
export class ElectricityGridDashboardModule {}
