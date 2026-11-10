import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VisXYContainerModule, VisLineModule, VisScatterModule, VisCrosshairModule, VisAxisModule, VisTooltipModule } from '@unovis/angular'

import { NativeTooltipContentComponent } from './native-tooltip-content.component'

@NgModule({
  imports: [CommonModule, VisXYContainerModule, VisLineModule, VisScatterModule, VisCrosshairModule, VisAxisModule, VisTooltipModule],
  declarations: [NativeTooltipContentComponent],
  exports: [NativeTooltipContentComponent],
})
export class NativeTooltipContentModule { }
