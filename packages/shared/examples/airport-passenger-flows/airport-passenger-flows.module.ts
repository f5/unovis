import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  VisAxisModule,
  VisBulletLegendModule,
  VisSingleContainerModule,
  VisStackedBarModule,
  VisTooltipModule,
  VisTopoJSONMapModule,
  VisXYContainerModule,
} from '@unovis/angular'
import { AirportPassengerFlowsComponent } from './airport-passenger-flows.component'

@NgModule({
  imports: [
    CommonModule,
    VisAxisModule,
    VisBulletLegendModule,
    VisSingleContainerModule,
    VisStackedBarModule,
    VisTooltipModule,
    VisTopoJSONMapModule,
    VisXYContainerModule,
  ],
  declarations: [AirportPassengerFlowsComponent],
  exports: [AirportPassengerFlowsComponent],
})
export class AirportPassengerFlowsModule {}
