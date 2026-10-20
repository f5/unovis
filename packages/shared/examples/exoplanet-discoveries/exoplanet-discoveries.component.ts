import { Component, ViewEncapsulation } from '@angular/core'
import * as c from './constants'

@Component({
  selector: 'exoplanet-discoveries',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './exoplanet-discoveries.component.html',
  styleUrls: ['./styles.css'],
})
export class ExoplanetDiscoveriesComponent {
  c = c
  state = c.initialState
  view = c.getView(this.state, patch => this.update(patch))

  update (patch: Partial<c.ExampleState>): void {
    this.state = { ...this.state, ...patch }
    this.view = c.getView(this.state, next => this.update(next))
  }

  changeEra (event: Event): void {
    this.update({ era: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
}
