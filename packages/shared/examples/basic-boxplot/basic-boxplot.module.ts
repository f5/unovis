import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisBoxplotModule, VisAxisModule } from '@unovis/angular'

import { BasicBoxplotComponent } from './basic-boxplot.component'

@NgModule({
  imports: [VisXYContainerModule, VisBoxplotModule, VisAxisModule],
  declarations: [BasicBoxplotComponent],
  exports: [BasicBoxplotComponent],
})
export class BasicBoxplotModule { }
