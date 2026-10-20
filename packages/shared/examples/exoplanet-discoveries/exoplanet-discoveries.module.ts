import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VisBulletLegendModule, VisNestedDonutModule, VisSingleContainerModule, VisTooltipModule } from '@unovis/angular'
import { ExoplanetDiscoveriesComponent } from './exoplanet-discoveries.component'

@NgModule({
  imports: [CommonModule, VisBulletLegendModule, VisNestedDonutModule, VisSingleContainerModule, VisTooltipModule],
  declarations: [ExoplanetDiscoveriesComponent],
  exports: [ExoplanetDiscoveriesComponent],
})
export class ExoplanetDiscoveriesModule {}
