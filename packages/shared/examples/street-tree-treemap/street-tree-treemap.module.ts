import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VisBulletLegendModule, VisSingleContainerModule, VisTooltipModule, VisTreemapModule } from '@unovis/angular'
import { StreetTreeTreemapComponent } from './street-tree-treemap.component'

@NgModule({
  imports: [CommonModule, VisBulletLegendModule, VisSingleContainerModule, VisTooltipModule, VisTreemapModule],
  declarations: [StreetTreeTreemapComponent],
  exports: [StreetTreeTreemapComponent],
})
export class StreetTreeTreemapModule {}
