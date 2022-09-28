import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisAreaModule, VisAxisModule, VisBulletLegendModule } from '@unovis/angular'

import { BasicAreaComponent } from './basic-area-chart.component'

@NgModule({
  imports: [VisXYContainerModule, VisAreaModule, VisAxisModule, VisBulletLegendModule],
  declarations: [BasicAreaComponent],
  exports: [BasicAreaComponent],
})
export class BasicAreaChartModule { }
