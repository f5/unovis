import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  VisAxisModule,
  VisBulletLegendModule,
  VisPlotlineModule,
  VisScatterModule,
  VisStackedBarModule,
  VisTooltipModule,
  VisXYContainerModule,
} from '@unovis/angular'
import { StateMigrationBalanceComponent } from './state-migration-balance.component'

@NgModule({
  imports: [
    CommonModule,
    VisAxisModule,
    VisBulletLegendModule,
    VisPlotlineModule,
    VisScatterModule,
    VisStackedBarModule,
    VisTooltipModule,
    VisXYContainerModule,
  ],
  declarations: [StateMigrationBalanceComponent],
  exports: [StateMigrationBalanceComponent],
})
export class StateMigrationBalanceModule {}
