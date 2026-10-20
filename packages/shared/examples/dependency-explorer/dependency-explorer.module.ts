import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VisBulletLegendModule, VisGraphModule, VisSingleContainerModule, VisTooltipModule } from '@unovis/angular'
import { DependencyExplorerComponent } from './dependency-explorer.component'

@NgModule({
  imports: [CommonModule, VisBulletLegendModule, VisGraphModule, VisSingleContainerModule, VisTooltipModule],
  declarations: [DependencyExplorerComponent],
  exports: [DependencyExplorerComponent],
})
export class DependencyExplorerModule {}
