import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VisAxisModule, VisBulletLegendModule, VisStackedBarModule, VisTooltipModule, VisXYContainerModule } from '@unovis/angular'
import { TreeHealthBarsComponent } from './tree-health-bars.component'

@NgModule({
  imports: [CommonModule, VisAxisModule, VisBulletLegendModule, VisStackedBarModule, VisTooltipModule, VisXYContainerModule],
  declarations: [TreeHealthBarsComponent],
  exports: [TreeHealthBarsComponent],
})
export class TreeHealthBarsModule {}
