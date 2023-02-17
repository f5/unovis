import { NgModule } from '@angular/core'
import { VisSingleContainerModule, VisChordDiagramModule } from '@unovis/angular'

import { SingleLevelChordDiagramComponent } from './single-level-chord-diagram.component'

@NgModule({
  imports: [VisSingleContainerModule, VisChordDiagramModule],
  declarations: [SingleLevelChordDiagramComponent],
  exports: [SingleLevelChordDiagramComponent],
})
export class SingleLevelChordDiagramModule { }
