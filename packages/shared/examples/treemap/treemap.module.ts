import { NgModule } from '@angular/core'
import { VisTreemapModule, VisBulletLegendModule, VisTooltipModule, VisSingleContainerModule } from '@unovis/angular'
import { TreemapComponent } from './treemap.component'

@NgModule({
  imports: [VisTreemapModule, VisBulletLegendModule, VisTooltipModule, VisSingleContainerModule],
  declarations: [TreemapComponent],
  exports: [TreemapComponent],
})
export class TreemapModule { }
