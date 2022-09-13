import { NgModule } from '@angular/core'

import { TopojsonMapComponent } from './topojson-map.component'
import { VisSingleContainerModule, VisTopoJSONMapModule, VisXYContainerModule, VisStackedBarModule, VisAxisModule, VisTooltipModule } from '@unovis/angular'

@NgModule({
  imports: [VisSingleContainerModule, VisTopoJSONMapModule, VisXYContainerModule, VisStackedBarModule, VisAxisModule, VisTooltipModule],
  declarations: [TopojsonMapComponent],
  exports: [TopojsonMapComponent],
})
export class TopojsonMapModule { }
