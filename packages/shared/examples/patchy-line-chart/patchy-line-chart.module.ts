import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  VisXYContainerModule,
  VisLineModule,
  VisAxisModule,
  VisCrosshairModule,
  VisScatterModule,
  VisTooltipModule,
  VisXYLabelsModule,
  VisBulletLegendModule,
} from '@unovis/angular'
import { PatchyLineChartComponent } from './patchy-line-chart.component'

@NgModule({
  imports: [CommonModule, VisXYContainerModule, VisLineModule, VisCrosshairModule, VisScatterModule, VisTooltipModule, VisAxisModule, VisXYLabelsModule, VisBulletLegendModule],
  declarations: [PatchyLineChartComponent],
  exports: [PatchyLineChartComponent],
})
export class PatchyLineChartModule { }
