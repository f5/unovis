import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  VisAxisModule,
  VisBulletLegendModule,
  VisScatterModule,
  VisSingleContainerModule,
  VisStackedBarModule,
  VisTooltipModule,
  VisTopoJSONMapModule,
  VisXYContainerModule,
} from '@unovis/angular'
import { EarthquakeExplorerComponent } from './earthquake-explorer.component'

@NgModule({
  imports: [
    CommonModule,
    VisAxisModule,
    VisBulletLegendModule,
    VisScatterModule,
    VisSingleContainerModule,
    VisStackedBarModule,
    VisTooltipModule,
    VisTopoJSONMapModule,
    VisXYContainerModule,
  ],
  declarations: [EarthquakeExplorerComponent],
  exports: [EarthquakeExplorerComponent],
})
export class EarthquakeExplorerModule {}
