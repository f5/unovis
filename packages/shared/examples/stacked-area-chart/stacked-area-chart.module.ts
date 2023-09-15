import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisAreaModule, VisXYLabelsModule, VisAxisModule } from '@unovis/angular'

import { StackedAreaComponent } from './stacked-area-chart.component'

@NgModule({
  imports: [VisXYContainerModule, VisAreaModule, VisXYLabelsModule, VisAxisModule],
  declarations: [StackedAreaComponent],
  exports: [StackedAreaComponent],
})
export class StackedAreaModule { }
