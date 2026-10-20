import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VisBulletLegendModule, VisChordDiagramModule, VisSingleContainerModule, VisTooltipModule } from '@unovis/angular'
import { StateMigrationChordComponent } from './state-migration-chord.component'

@NgModule({
  imports: [CommonModule, VisBulletLegendModule, VisChordDiagramModule, VisSingleContainerModule, VisTooltipModule],
  declarations: [StateMigrationChordComponent],
  exports: [StateMigrationChordComponent],
})
export class StateMigrationChordModule {}
