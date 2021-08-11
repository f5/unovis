// // Copyright (c) Volterra, Inc. All rights reserved.
import { AtomicAngularWrapperComponent } from 'examples/atomic-angular-wrapper/atomic-angular-wrapper.component'
import { NgModule } from '@angular/core'
import { VisXYContainerModule, VisAreaModule, VisLineModule, VisAxisModule } from '@volterra/vis-angular'

@NgModule({
  imports: [VisXYContainerModule, VisAreaModule, VisLineModule, VisAxisModule],
  declarations: [AtomicAngularWrapperComponent],
  exports: [AtomicAngularWrapperComponent],
})
export class AtomicAngularWrapperModule { }
