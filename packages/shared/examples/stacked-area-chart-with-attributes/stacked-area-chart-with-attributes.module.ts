import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisAreaModule, VisAxisModule, VisBulletLegendModule } from '@unovis/angular'

import { StackedAreaWithAttributesComponent } from './stacked-area-chart-with-attributes.component'

@NgModule({
  imports: [VisXYContainerModule, VisAreaModule, VisAxisModule, VisBulletLegendModule],
  declarations: [StackedAreaWithAttributesComponent],
  exports: [StackedAreaWithAttributesComponent],
})
export class StackedAreaWithAttributesModule { }
