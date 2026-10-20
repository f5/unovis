import { Component, ViewEncapsulation } from '@angular/core'
import * as c from './constants'

@Component({
  selector: 'electricity-grid-dashboard',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './electricity-grid-dashboard.component.html',
  styleUrls: ['./styles.css'],
})
export class ElectricityGridDashboardComponent {
  c = c
  state = c.initialState
  view = c.getView(this.state, patch => this.update(patch))

  update (patch: Partial<c.ExampleState>): void {
    this.state = { ...this.state, ...patch }
    this.view = c.getView(this.state, next => this.update(next))
  }

  changeAuthority (event: Event): void {
    this.update({ authority: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
}
