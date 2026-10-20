import { Component, ViewEncapsulation } from '@angular/core'
import * as c from './constants'

@Component({
  selector: 'airport-passenger-flows',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './airport-passenger-flows.component.html',
  styleUrls: ['./styles.css'],
})
export class AirportPassengerFlowsComponent {
  c = c
  state = c.initialState
  view = c.getView(this.state)

  update (patch: Partial<c.ExampleState>): void {
    this.state = { ...this.state, ...patch }
    this.view = c.getView(this.state)
  }

  changeHub (event: Event): void {
    this.update({ hub: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
}
