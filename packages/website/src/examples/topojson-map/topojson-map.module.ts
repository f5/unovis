import { NgModule } from '@angular/core'
import {
  VisSingleContainerModule,
  VisTopoJSONMapModule,
  VisXYContainerModule,
  VisStackedBarModule,
  VisAxisModule,
  VisTooltipModule,
} from '@unovis/angular'
import { TopojsonMapComponent } from './topojson-map.component'

@NgModule({
  imports: [VisSingleContainerModule, VisTopoJSONMapModule, VisXYContainerModule, VisStackedBarModule, VisAxisModule, VisTooltipModule],
  declarations: [TopojsonMapComponent],
  exports: [TopojsonMapComponent],
})
export class TopojsonMapModule { }
