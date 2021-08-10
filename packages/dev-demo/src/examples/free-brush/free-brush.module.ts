// // Copyright (c) Volterra, Inc. All rights reserved.
import { FreeBrushComponent } from 'examples/free-brush/free-brush.component'
import { NgModule } from '@angular/core'
import { VisAngularModule } from '@volterra/vis-angular'

@NgModule({
  imports: [VisAngularModule],
  declarations: [FreeBrushComponent],
  exports: [FreeBrushComponent],
})
export class FreeBrushModule { }
