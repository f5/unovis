import { NgModule } from '@angular/core'
import { VisSingleContainerModule, VisChordDiagramModule } from '@unovis/angular'

import { HierarchicalChordDiagramComponent } from './hierarchical-chord-diagram.component'

@NgModule({
  imports: [VisSingleContainerModule, VisChordDiagramModule],
  declarations: [HierarchicalChordDiagramComponent],
  exports: [HierarchicalChordDiagramComponent],
})
export class HierarchicalChordDiagramModule { }
