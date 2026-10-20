import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VisBulletLegendModule, VisSankeyModule, VisSingleContainerModule, VisTooltipModule } from '@unovis/angular'
import { EnergyFlowSankeyComponent } from './energy-flow-sankey.component'

@NgModule({
  imports: [CommonModule, VisBulletLegendModule, VisSankeyModule, VisSingleContainerModule, VisTooltipModule],
  declarations: [EnergyFlowSankeyComponent],
  exports: [EnergyFlowSankeyComponent],
})
export class EnergyFlowSankeyModule {}
