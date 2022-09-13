import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisAreaModule, VisXYLabelsModule, VisAxisModule } from '@unovis/angular'

import { BasicAreaComponent } from './basic-area.component'

@NgModule({
  imports: [VisXYContainerModule, VisAreaModule, VisXYLabelsModule, VisAxisModule],
  declarations: [BasicAreaComponent],
  exports: [BasicAreaComponent],
})
export class BasicAreaModule { }
