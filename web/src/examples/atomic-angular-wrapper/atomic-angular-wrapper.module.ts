// // Copyright (c) Volterra, Inc. All rights reserved.
import { AtomicAngularWrapperComponent } from 'examples/atomic-angular-wrapper/atomic-angular-wrapper.component'
import { NgModule } from '@angular/core'
import { VisAngularModule } from '@volterra/vis-angular'

@NgModule({
  imports: [VisAngularModule],
  declarations: [AtomicAngularWrapperComponent],
  exports: [AtomicAngularWrapperComponent],
})
export class AtomicAngularWrapperModule { }
