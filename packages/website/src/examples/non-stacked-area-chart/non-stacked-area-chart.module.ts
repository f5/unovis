import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisAreaModule, VisAxisModule, VisBulletLegendModule } from '@unovis/angular'

import { NonStackedAreaComponent } from './non-stacked-area-chart.component'

@NgModule({
  imports: [VisXYContainerModule, VisAreaModule, VisAxisModule, VisBulletLegendModule],
  declarations: [NonStackedAreaComponent],
  exports: [NonStackedAreaComponent],
})
export class NonStackedAreaChartModule { }
