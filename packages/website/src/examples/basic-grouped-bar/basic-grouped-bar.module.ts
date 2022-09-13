import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisGroupedBarModule, VisAxisModule, VisBulletLegendModule } from '@unovis/angular'

import { BasicGroupedBarComponent } from './basic-grouped-bar.component'

@NgModule({
  imports: [VisXYContainerModule, VisGroupedBarModule, VisAxisModule, VisBulletLegendModule],
  declarations: [BasicGroupedBarComponent],
  exports: [BasicGroupedBarComponent],
})
export class BasicGroupedBarModule { }
