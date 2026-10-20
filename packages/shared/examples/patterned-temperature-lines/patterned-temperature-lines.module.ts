import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VisAxisModule, VisBulletLegendModule, VisCrosshairModule, VisLineModule, VisTooltipModule, VisXYContainerModule } from '@unovis/angular'
import { PatternedTemperatureLinesComponent } from './patterned-temperature-lines.component'

@NgModule({
  imports: [CommonModule, VisAxisModule, VisBulletLegendModule, VisCrosshairModule, VisLineModule, VisTooltipModule, VisXYContainerModule],
  declarations: [PatternedTemperatureLinesComponent],
  exports: [PatternedTemperatureLinesComponent],
})
export class PatternedTemperatureLinesModule {}
