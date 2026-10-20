import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VisAxisModule, VisBoxplotModule, VisBulletLegendModule, VisScatterModule, VisTooltipModule, VisXYContainerModule } from '@unovis/angular'
import { PenguinDistributionsComponent } from './penguin-distributions.component'

@NgModule({
  imports: [CommonModule, VisAxisModule, VisBoxplotModule, VisBulletLegendModule, VisScatterModule, VisTooltipModule, VisXYContainerModule],
  declarations: [PenguinDistributionsComponent],
  exports: [PenguinDistributionsComponent],
})
export class PenguinDistributionsModule {}
