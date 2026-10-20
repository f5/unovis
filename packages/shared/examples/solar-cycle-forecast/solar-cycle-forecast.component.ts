import { Component, ViewEncapsulation } from '@angular/core'
import * as c from './constants'

@Component({
  selector: 'solar-cycle-forecast',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './solar-cycle-forecast.component.html',
  styleUrls: ['./styles.css'],
})
export class SolarCycleForecastComponent {
  c = c
  state = c.initialState
  view = c.getView(this.state, patch => this.update(patch))

  update (patch: Partial<c.ExampleState>): void {
    this.state = { ...this.state, ...patch }
    this.view = c.getView(this.state, next => this.update(next))
  }

  reset (): void {
    this.update(c.initialState)
  }
}
