import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VisXYContainerModule, VisLineModule, VisStackedBarModule, VisAxisModule, VisAnnotationsModule } from '@unovis/angular'

import { BasicAnnotationsComponent } from './basic-annotations.component'

@NgModule({
  declarations: [BasicAnnotationsComponent],
  imports: [
    CommonModule,
    VisXYContainerModule,
    VisLineModule,
    VisStackedBarModule,
    VisAxisModule,
    VisAnnotationsModule,
  ],
  exports: [BasicAnnotationsComponent],
})
export class BasicAnnotationsModule { }
