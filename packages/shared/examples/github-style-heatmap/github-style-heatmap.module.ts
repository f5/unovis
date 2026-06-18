import { NgModule } from '@angular/core'
import { VisSingleContainerModule, VisHeatmapModule } from '@unovis/angular'

import { GitHubStyleHeatmapComponent } from './github-style-heatmap.component'

@NgModule({
  imports: [VisSingleContainerModule, VisHeatmapModule],
  declarations: [GitHubStyleHeatmapComponent],
  exports: [GitHubStyleHeatmapComponent],
})
export class GitHubStyleHeatmapModule { }
