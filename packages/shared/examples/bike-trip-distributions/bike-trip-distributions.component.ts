import { Component, ViewEncapsulation } from '@angular/core'
import * as c from './constants'

@Component({
  selector: 'bike-trip-distributions',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './bike-trip-distributions.component.html',
  styleUrls: ['./styles.css'],
})
export class BikeTripDistributionsComponent {
  c = c
  state = c.initialState
  view = c.getView(this.state)

  update (patch: Partial<c.ExampleState>): void {
    this.state = { ...this.state, ...patch }
    this.view = c.getView(this.state)
  }

  changeRider (event: Event): void {
    this.update({ rider: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  changeLimit (event: Event): void {
    this.update({ limit: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
}
